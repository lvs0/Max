# MAX Tools Reference

MAX uses tools to interact with the user's system. All tools are executed locally.

## Available Tools

### execute_code

Execute Python code in a sandboxed subprocess.

**Parameters:**
- `code` (string, required): Python code to run
- `timeout` (integer, optional): Timeout in seconds (default: 10)

**Example:**
```
You: Calculate the sum of numbers 1 to 100
MAX: Uses execute_code to run Python
```

**Output:**
```
STDOUT:
5050
STDERR:
(none)
```

---

### read_file

Read the contents of a local file.

**Parameters:**
- `path` (string, required): Absolute or relative file path

**Example:**
```
You: Read my config.py file
MAX: Uses read_file to get contents
```

**Limits:**
- Maximum 5000 characters
- Binary files not supported

---

### write_file

Write content to a local file.

**Parameters:**
- `path` (string, required): File path to write
- `content` (string, required): Content to write

**Example:**
```
You: Create a README.md with "Hello World"
MAX: Uses write_file to create the file
```

**Note:** Will overwrite existing files.

---

### shell_command

Run shell commands safely.

**Parameters:**
- `command` (string, required): Shell command to execute

**Safe Commands:**
- `ls`, `pwd`, `cat`, `echo`
- `git` commands
- `pip install`
- `npm` commands
- File operations

**Blocked Commands:**
- `rm -rf` (with exceptions)
- `mkfs`, `dd`
- `shutdown`, `reboot`
- Fork bombs

**Example:**
```
You: List all files in the current directory
MAX: Uses shell_command to run `ls -la`
```

---

### remember

Store information in persistent memory.

**Parameters:**
- `key` (string, required): Memory key
- `value` (string, required): Value to store

**Example:**
```
You: Remember that my favorite color is blue
MAX: ✓ Stored: favorite_color
```

**Note:** Data is stored in SQLite database locally.

---

### recall

Retrieve information from persistent memory.

**Parameters:**
- `key` (string, required): Memory key to recall

**Example:**
```
You: What's my favorite color?
MAX: Your favorite color is blue
```

---

## Tool Selection

MAX decides which tools to use based on:

1. **Understanding the request** - What does the user want?
2. **Planning** - Which tools are needed?
3. **Execution** - Run tools in sequence
4. **Response** - Present results to user

## Error Handling

If a tool fails, MAX will:
1. Report the error
2. Try an alternative approach if possible
3. Ask for clarification if needed

## Customization

Add new tools in `backend/main.py`:

```python
TOOLS_SCHEMA = [
    # existing tools...
    {
        "name": "my_tool",
        "description": "What it does",
        "parameters": {
            "type": "object",
            "properties": {
                "param": {"type": "string"}
            },
            "required": ["param"]
        }
    }
]

def dispatch_tool(name: str, args: dict) -> str:
    match name:
        # existing cases...
        case "my_tool":
            return my_tool_function(args["param"])
```

## Security

- All tools run with user's permissions
- Shell commands are sandboxed
- File access is controlled by OS permissions
- No network access by default
- No data sent to external servers (unless using Groq)
