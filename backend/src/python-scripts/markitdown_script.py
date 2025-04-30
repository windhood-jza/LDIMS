# LDIMS/backend/src/python-scripts/markitdown_script.py
import sys
import os
import traceback
import argparse  # 使用 argparse 处理参数

# 确认可以导入 markitdown 库
try:
    # 根据 GitHub README 示例，直接导入类 MarkItDown
    from markitdown import MarkItDown
except ImportError:
    print("Error: Failed to import the 'markitdown' library.", file=sys.stderr)
    print(
        "Please ensure 'markitdown' with required extras ([docx,pdf,...]) is installed.",
        file=sys.stderr,
    )
    sys.exit(1)


def process_file(file_path, azure_endpoint=None):
    """
    使用 MarkItDown 处理指定的文件并返回 Markdown 文本。
    可选地使用 Azure Document Intelligence (Key需通过环境变量设置)。
    """
    try:
        print(f"Processing file: {file_path}", file=sys.stderr)  # Log 开始处理
        azure_key_present = os.environ.get(
            "AZURE_DOCUMENT_INTELLIGENCE_KEY"
        ) or os.environ.get("AZURE_AI_FORM_RECOGNIZER_KEY")

        if azure_endpoint:
            if not azure_key_present:
                print(
                    "Warning: Azure endpoint provided, but AZURE_DOCUMENT_INTELLIGENCE_KEY environment variable not found. Proceeding without Azure DI.",
                    file=sys.stderr,
                )
                md = MarkItDown()  # Key 不存在，回退到普通模式
            else:
                print(
                    "Attempting conversion with Azure Document Intelligence (Endpoint provided, Key expected in env var).",
                    file=sys.stderr,
                )
                # Key 通过环境变量 AZURE_DOCUMENT_INTELLIGENCE_KEY (或 AZURE_AI_FORM_RECOGNIZER_KEY) 由库自动读取
                md = MarkItDown(docintel_endpoint=azure_endpoint)
        else:
            print(
                "Attempting conversion without Azure Document Intelligence.",
                file=sys.stderr,
            )
            md = MarkItDown()  # 默认实例化

        # 调用 convert 方法
        result = md.convert(file_path)

        # convert 方法返回一个包含 text_content 的对象
        markdown_content = result.text_content

        if markdown_content is None:
            print(
                f"Warning: MarkItDown returned None for file: {file_path}",
                file=sys.stderr,
            )
            return ""  # 返回空字符串

        print("Conversion successful.", file=sys.stderr)  # Log 成功
        return markdown_content

    except FileNotFoundError:
        print(f"Error: File not found at path: {file_path}", file=sys.stderr)
        sys.exit(2)  # 特定退出码表示文件找不到
    except Exception as e:
        print(f"Error processing file '{file_path}' with MarkItDown:", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)  # 打印详细的异常堆栈到 stderr
        sys.exit(3)  # 特定退出码表示处理失败


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Convert various file types to Markdown using MarkItDown."
    )
    parser.add_argument("input_file", help="Path to the input file.")
    parser.add_argument(
        "--azure-endpoint",
        help="Azure Document Intelligence endpoint URL. Requires AZURE_DOCUMENT_INTELLIGENCE_KEY env var to be set.",
        default=None,
    )
    # 可以添加 --enable-plugins 参数如果需要的话

    args = parser.parse_args()

    # 检查输入文件是否存在
    if not os.path.exists(args.input_file):
        print(f"Error: Input file does not exist: {args.input_file}", file=sys.stderr)
        sys.exit(2)

    # 调用处理函数，只传递 endpoint。Key 的处理依赖于环境变量。
    markdown_output = process_file(args.input_file, args.azure_endpoint)

    # 将结果打印到标准输出 (确保 UTF-8)
    try:
        # 尝试重新配置 stdout 编码，适用于某些环境
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8")
        # 在其他情况下，Python 3 通常默认使用 UTF-8 或系统默认编码
    except Exception as e:
        print(f"Warning: Could not reconfigure stdout to UTF-8: {e}", file=sys.stderr)

    try:
        print(markdown_output)
    except UnicodeEncodeError as e:
        print(
            f"Error: Failed to print output due to encoding issues: {e}",
            file=sys.stderr,
        )
        # 可以尝试用 'ignore' 或 'replace' 错误处理方式再次打印，但这会丢失信息
        # print(markdown_output.encode('utf-8', errors='replace').decode('utf-8'))
        sys.exit(4)  # 特定退出码表示输出编码错误

    # 正常退出
    sys.exit(0)
