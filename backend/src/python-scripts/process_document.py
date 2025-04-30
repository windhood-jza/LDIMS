import argparse
import sys
import os
from pathlib import Path
import traceback

# --- 打印环境信息用于调试 ---
print("--- Python Environment Info ---", file=sys.stderr)
print(f"Executable: {sys.executable}", file=sys.stderr)
print("sys.path:", file=sys.stderr)
for p in sys.path:
    print(f"  - {p}", file=sys.stderr)
print(f"PYTHONPATH: {os.environ.get('PYTHONPATH')}", file=sys.stderr)
print(f"PYTHONHOME: {os.environ.get('PYTHONHOME')}", file=sys.stderr)
print("-----------------------------", file=sys.stderr)

# --- 配置 ---
# 可以根据需要调整支持的语言，例如 'ch', 'en', 'ch+en'
# 'ch' 表示中文和英文模型 (PaddleOCR v2.0+ 默认)
OCR_LANG = "ch"
# 是否在 PaddleOCR 初始化时使用 GPU (需要正确安装 paddlepaddle-gpu)
USE_GPU = False  # 通常服务器 CPU 版本更常见

MIN_TEXT_LENGTH_THRESHOLD = 10  # MarkItDown 提取内容少于此长度时，尝试 OCR

# --- 尝试导入库 ---
try:
    from markitdown import MarkItDown, UnsupportedFormatException
except ImportError:
    print("Error: Failed to import the 'markitdown' library.", file=sys.stderr)
    print(
        "Please ensure 'markitdown' with required extras ([docx,pdf,...]) is installed in the correct environment.",
        file=sys.stderr,
    )
    sys.exit(1)

try:
    from paddleocr import PaddleOCR
except ImportError:
    print("Error: Failed to import the 'paddleocr' library.", file=sys.stderr)
    print(
        "Please ensure 'paddleocr' and 'paddlepaddle' are installed in the correct environment.",
        file=sys.stderr,
    )
    sys.exit(1)

# --- 全局初始化 ---
# MarkItDown 实例 (如果需要全局配置)
# md = MarkItDown() # 或者根据需要配置 Azure 等

# PaddleOCR 实例 (延迟初始化，只在需要时创建)
ocr_engine = None


def initialize_ocr():
    """初始化 PaddleOCR 引擎"""
    global ocr_engine
    if ocr_engine is None:
        try:
            print(
                f"Initializing PaddleOCR engine (lang={OCR_LANG}, use_gpu={USE_GPU})...",
                file=sys.stderr,
            )
            # use_angle_cls=True 尝试自动修正文本方向
            # det=True (检测), rec=True (识别) 都是默认值
            ocr_engine = PaddleOCR(
                use_angle_cls=True, lang=OCR_LANG, use_gpu=USE_GPU, show_log=False
            )
            print("PaddleOCR engine initialized successfully.", file=sys.stderr)
        except Exception as e:
            print(f"Error initializing PaddleOCR engine: {e}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            # 不直接退出，可能后续 MarkItDown 还能用
            # sys.exit(4)
    return ocr_engine


def process_with_markitdown(file_path: Path) -> str:
    """使用 MarkItDown 处理文件"""
    print(f"Processing file with MarkItDown: {file_path}", file=sys.stderr)
    md = MarkItDown()
    try:
        # --- 修正：获取 .text_content ---
        result = md.convert(str(file_path))
        markdown_content = result.text_content if result else None

        if markdown_content is None:
            print(
                "MarkItDown conversion returned None text content.", file=sys.stderr
            )  # 修改日志信息
            return ""  # 返回空字符串表示未提取到内容
        else:
            print("MarkItDown conversion successful.", file=sys.stderr)
            return markdown_content  # 返回提取到的内容

    except UnsupportedFormatException as e:
        print(
            f"MarkItDown Error: File type ({file_path.suffix}) is not supported by MarkItDown. {e}",
            file=sys.stderr,
        )
        # 对于不支持的格式，我们可以返回特定标记或 None，让主流程决定是否 OCR
        # 这里为了简化，直接让其失败退出，符合之前对 .doc 的处理
        sys.exit(3)
    except Exception as e:
        print(f"Error processing file '{file_path}' with MarkItDown:", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(2)


def process_with_paddleocr(file_path: Path) -> str:
    """使用 PaddleOCR 处理图像文件"""
    print(f"Processing image with PaddleOCR: {file_path}", file=sys.stderr)
    engine = initialize_ocr()
    if not engine:
        print("OCR engine failed to initialize. Cannot process image.", file=sys.stderr)
        sys.exit(4)  # 特定退出码表示 OCR 引擎错误

    try:
        # PaddleOCR 处理本地文件路径
        result = engine.ocr(str(file_path), cls=True)  # cls=True 启用角度分类
        extracted_texts = []
        if result and result[0]:  # PaddleOCR 返回列表的列表，第一层通常只有一个元素
            for line in result[0]:
                if line and len(line) >= 2:
                    text_info = line[1]  # 第二个元素是 (文本, 置信度) 元组
                    if isinstance(text_info, (list, tuple)) and len(text_info) > 0:
                        extracted_texts.append(
                            str(text_info[0])
                        )  # 取元组的第一个元素（文本）

        print(
            f"PaddleOCR processing completed. Extracted {len(extracted_texts)} lines.",
            file=sys.stderr,
        )
        # 将所有识别的文本行连接成一个 Markdown 字符串
        return "\n".join(extracted_texts)
    except Exception as e:
        print(f"Error processing file '{file_path}' with PaddleOCR:", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(2)  # 通用处理错误


def main():
    parser = argparse.ArgumentParser(
        description="Process various document types using MarkItDown or PaddleOCR."
    )
    parser.add_argument("file_path", type=str, help="Path to the input file.")
    # 可以添加其他参数，例如 --force-ocr 等

    args = parser.parse_args()
    file_path = Path(args.file_path)

    if not file_path.exists():
        print(f"Error: Input file not found at '{file_path}'", file=sys.stderr)
        sys.exit(2)

    file_extension = file_path.suffix.lower()
    markdown_content = ""

    # 文件类型判断与分发
    if file_extension == ".pdf":
        print(f"Processing PDF file: {file_path}", file=sys.stderr)
        # 1. 先尝试 MarkItDown
        markdown_content = process_with_markitdown(file_path)

        # 2. 如果 MarkItDown 结果为空或过短，尝试 OCR
        if not markdown_content or len(markdown_content) < MIN_TEXT_LENGTH_THRESHOLD:
            print(
                f"Warning: MarkItDown result for PDF is empty or too short (length: {len(markdown_content)}). Attempting OCR fallback.",
                file=sys.stderr,
            )
            markdown_content = process_with_paddleocr(file_path)
        else:
            print("Using MarkItDown result for PDF.", file=sys.stderr)

    elif file_extension == ".docx":
        # 对于 docx，通常 MarkItDown 效果较好，直接使用
        markdown_content = process_with_markitdown(file_path)
    elif file_extension in [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif"]:
        markdown_content = process_with_paddleocr(file_path)
    elif file_extension == ".doc":
        print(
            f"Error: Unsupported file type '{file_extension}'. Old '.doc' format is not supported.",
            file=sys.stderr,
        )
        sys.exit(3)
    else:
        print(
            f"Warning: Attempting MarkItDown for unknown file type '{file_extension}'.",
            file=sys.stderr,
        )
        markdown_content = process_with_markitdown(file_path)

    # 将结果输出到标准输出
    # print(markdown_content)
    # 将结果显式编码为 UTF-8 并写入标准输出的字节流
    try:
        utf8_output_bytes = markdown_content.encode("utf-8")
        sys.stdout.buffer.write(utf8_output_bytes)
        sys.stdout.flush()  # 确保缓冲区被刷新
    except Exception as e:
        print(f"Error writing UTF-8 output to stdout: {e}", file=sys.stderr)
        sys.exit(5)  # 特定退出码表示输出错误

    sys.exit(0)  # 确保成功时退出码为 0


if __name__ == "__main__":
    main()
