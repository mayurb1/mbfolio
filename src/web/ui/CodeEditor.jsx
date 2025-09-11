import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Copy,
  Play,
  Download,
  Maximize2,
  RotateCcw,
  Terminal,
  Code2,
  Trash2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import Editor from '@monaco-editor/react'

const CodeEditor = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('')
  const [theme] = useState('vs-dark')
  const [, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState([])
  const [compilationErrors, setCompilationErrors] = useState([])
  const [isConsoleOpen, setIsConsoleOpen] = useState(true)
  const [consolePanelWidth, setConsolePanelWidth] = useState(400) // Default width in pixels
  const [isDragging, setIsDragging] = useState(false)
  const editorRef = useRef(null)
  const outputRef = useRef(null)
  const resizerRef = useRef(null)

  // Portfolio-focused code template
  const codeTemplate = useMemo(
    () => `// Mayur's Portfolio - JavaScript Skills Demo
console.log("👋 Hi! I'm Mayur Bhalgama - Frontend Developer");`,
    []
  )

  // Load saved code from localStorage when component opens
  useEffect(() => {
    if (isOpen) {
      const savedCode = localStorage.getItem('codeEditor-javascript')
      if (savedCode && savedCode.trim() !== '' && savedCode !== codeTemplate) {
        // Load saved custom code
        setCode(savedCode)
      } else {
        // Load template only if no saved code exists
        setCode(codeTemplate)
      }
    }
  }, [isOpen, codeTemplate])

  // Save code to localStorage when it changes (debounced)
  useEffect(() => {
    if (code !== undefined) {
      // Save even empty code
      const timeoutId = setTimeout(() => {
        if (code.trim() === '') {
          // If code is empty, remove from localStorage so template loads next time
          localStorage.removeItem('codeEditor-javascript')
        } else if (code !== codeTemplate) {
          // Save only if different from template
          localStorage.setItem('codeEditor-javascript', code)
        }
      }, 1000) // Save after 1 second of inactivity

      return () => clearTimeout(timeoutId)
    }
  }, [code, codeTemplate])

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor

    // Configure editor options
    editor.updateOptions({
      fontSize: fontSize,
      minimap: { enabled: false },
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: true,
      lineNumbers: 'on',
      roundedSelection: false,
      tabSize: 2,
      insertSpaces: true,
    })

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleDownloadCode()
    })
  }

  // Execute code based on language
  const handleRunCode = async () => {
    setIsRunning(true)
    setConsoleOutput([])
    setCompilationErrors([])

    try {
      const result = executeJavaScript(code)

      setConsoleOutput(result.logs || [])

      if (result.error) {
        setCompilationErrors([{ line: 1, message: result.error }])
      }
    } catch (error) {
      setConsoleOutput([{ type: 'error', content: error.message }])
      setCompilationErrors([{ line: 1, message: error.message }])
    } finally {
      setIsRunning(false)
    }
  }

  // Simple JavaScript execution
  const executeJavaScript = code => {
    const logs = []

    const customConsole = {
      log: (...args) => logs.push({ type: 'log', content: args.join(' ') }),
      error: (...args) => logs.push({ type: 'error', content: args.join(' ') }),
      warn: (...args) => logs.push({ type: 'warn', content: args.join(' ') }),
      info: (...args) => logs.push({ type: 'info', content: args.join(' ') }),
    }

    try {
      const result = new Function('console', code)(customConsole)

      return {
        success: true,
        logs: logs,
        result: result,
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        logs: [...logs, { type: 'error', content: error.message }],
        error: error.message,
      }
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      console.log('Code copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'code.js'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Reset code to template
  const handleResetCode = () => {
    setCode(codeTemplate)
    setOutput('')
    setConsoleOutput([])
    setCompilationErrors([])
  }

  // Clear all code (start fresh)
  const handleClearCode = () => {
    setCode('')
    setOutput('')
    setConsoleOutput([])
    setCompilationErrors([])
    // Also clear from localStorage
    localStorage.removeItem('codeEditor-javascript')
  }

  // Console panel resize functionality
  const handleMouseDown = useCallback(e => {
    setIsDragging(true)
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback(
    e => {
      if (!isDragging) return

      const container = resizerRef.current?.parentElement
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const newWidth = containerRect.right - e.clientX

      // Set min/max width constraints
      const minWidth = 250
      const maxWidth = containerRect.width * 0.7 // Max 70% of container

      setConsolePanelWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)))
    },
    [isDragging]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Toggle console visibility
  const toggleConsole = () => {
    setIsConsoleOpen(!isConsoleOpen)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`${isFullscreen ? 'w-full h-full' : 'max-w-6xl w-full h-[90vh]'} flex flex-col rounded-xl overflow-hidden shadow-2xl`}
          style={{ backgroundColor: 'var(--color-background)' }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold">JavaScript Code Editor</h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-background)',
                }}
                aria-label={isRunning ? 'Code is currently running' : 'Execute the code'}
              >
                <Play size={16} />
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
              </button>

              <div className="flex items-center space-x-1">
                <button
                  onClick={toggleConsole}
                  className="p-2 rounded-lg transition-colors duration-200"
                  style={{
                    ':hover': { backgroundColor: 'var(--color-surface)' },
                  }}
                  onMouseEnter={e =>
                    (e.target.style.backgroundColor = 'var(--color-surface)')
                  }
                  onMouseLeave={e =>
                    (e.target.style.backgroundColor = 'transparent')
                  }
                  aria-label="Toggle console"
                  title="Toggle console"
                >
                  {isConsoleOpen ? (
                    <ChevronRight size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg transition-colors duration-200"
                  style={{
                    ':hover': { backgroundColor: 'var(--color-surface)' },
                  }}
                  onMouseEnter={e =>
                    (e.target.style.backgroundColor = 'var(--color-surface)')
                  }
                  onMouseLeave={e =>
                    (e.target.style.backgroundColor = 'transparent')
                  }
                  aria-label="Copy code to clipboard"
                  title="Copy code"
                >
                  <Copy size={16} />
                </button>

                <button
                  onClick={handleDownloadCode}
                  className="p-2 rounded-lg transition-colors duration-200"
                  style={{
                    ':hover': { backgroundColor: 'var(--color-surface)' },
                  }}
                  onMouseEnter={e =>
                    (e.target.style.backgroundColor = 'var(--color-surface)')
                  }
                  onMouseLeave={e =>
                    (e.target.style.backgroundColor = 'transparent')
                  }
                  aria-label="Download code as file"
                  title="Download code"
                >
                  <Download size={16} />
                </button>

                <button
                  onClick={handleResetCode}
                  className="p-2 rounded-lg transition-colors duration-200"
                  style={{
                    ':hover': { backgroundColor: 'var(--color-surface)' },
                  }}
                  onMouseEnter={e =>
                    (e.target.style.backgroundColor = 'var(--color-surface)')
                  }
                  onMouseLeave={e =>
                    (e.target.style.backgroundColor = 'transparent')
                  }
                  aria-label="Reset code to default template"
                  title="Reset to template"
                >
                  <RotateCcw size={16} />
                </button>

                <button
                  onClick={handleClearCode}
                  className="p-2 rounded-lg transition-colors duration-200"
                  style={{
                    ':hover': { backgroundColor: 'var(--color-surface)' },
                  }}
                  onMouseEnter={e =>
                    (e.target.style.backgroundColor = 'var(--color-surface)')
                  }
                  onMouseLeave={e =>
                    (e.target.style.backgroundColor = 'transparent')
                  }
                  aria-label="Clear all code from editor"
                  title="Clear all code"
                >
                  <Trash2 size={16} />
                </button>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-lg transition-colors duration-200"
                  style={{
                    ':hover': { backgroundColor: 'var(--color-surface)' },
                  }}
                  onMouseEnter={e =>
                    (e.target.style.backgroundColor = 'var(--color-surface)')
                  }
                  onMouseLeave={e =>
                    (e.target.style.backgroundColor = 'transparent')
                  }
                  aria-label={isFullscreen ? 'Exit fullscreen mode' : 'Enter fullscreen mode'}
                  title="Toggle fullscreen"
                >
                  <Maximize2 size={16} />
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-surface rounded-lg transition-colors duration-200"
                aria-label="Close editor"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Code Editor */}
            <div
              className="flex-1 flex flex-col"
              style={{
                width: isConsoleOpen
                  ? `calc(100% - ${consolePanelWidth}px)`
                  : '100%',
              }}
            >
              <div
                className="px-4 py-2 text-sm font-medium border-b flex items-center justify-between"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <div className="flex items-center space-x-2">
                  <Code2 size={16} />
                  <span>Editor</span>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-xs">Font Size:</label>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                    className="w-16"
                  />
                  <span className="text-xs">{fontSize}px</span>
                </div>
              </div>

              <div className="flex-1">
                <Editor
                  height="100%"
                  language="javascript"
                  value={code}
                  onChange={setCode}
                  onMount={handleEditorDidMount}
                  theme={theme}
                  options={{
                    fontSize: fontSize,
                    minimap: { enabled: window.innerWidth > 1024 },
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: true,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    tabSize: 2,
                    insertSpaces: true,
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                      verticalScrollbarSize: 12,
                      horizontalScrollbarSize: 12,
                      verticalSliderSize: 12,
                      horizontalSliderSize: 12,
                    },
                    overviewRulerLanes: 3,
                    overviewRulerBorder: false,
                    mouseWheelScrollSensitivity: 1,
                    fastScrollSensitivity: 5,
                  }}
                />
              </div>
            </div>

            {/* Resizer */}
            {isConsoleOpen && (
              <div
                ref={resizerRef}
                className="w-1 cursor-col-resize transition-colors duration-200 flex-shrink-0"
                style={{
                  backgroundColor: isDragging
                    ? 'var(--color-primary)'
                    : 'var(--color-border)',
                }}
                onMouseDown={handleMouseDown}
              />
            )}

            {/* Output Panel */}
            {isConsoleOpen && (
              <div
                className="flex flex-col border-l"
                style={{
                  borderColor: 'var(--color-border)',
                  width: `${consolePanelWidth}px`,
                  minWidth: '250px',
                  maxWidth: '70%',
                }}
              >
                <div
                  className="px-4 py-2 text-sm font-medium border-b flex items-center justify-between"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Terminal size={16} />
                    <span>Console Output</span>
                  </div>
                  {isRunning && (
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      />
                      <span className="text-xs">Running</span>
                    </div>
                  )}
                </div>

                <div
                  className="flex-1 p-4 font-mono text-sm overflow-auto"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                  }}
                  ref={outputRef}
                >
                  {consoleOutput.length > 0 ? (
                    <div className="space-y-1">
                      {consoleOutput.map((log, index) => (
                        <div
                          key={index}
                          className={`${
                            log.type === 'error'
                              ? 'text-red-500'
                              : log.type === 'warn'
                                ? 'text-yellow-500'
                                : log.type === 'info'
                                  ? 'text-blue-500'
                                  : ''
                          }`}
                        >
                          <span className="mr-2" style={{ color: 'var(--color-text-secondary)' }}>
                            [{log.type}]
                          </span>
                          {log.content}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-text-secondary italic flex items-center space-x-2">
                      <Play size={16} />
                      <span>
                        Click &ldquo;Run Code&rdquo; or press Ctrl+Enter to
                        execute
                      </span>
                    </div>
                  )}
                </div>

                {compilationErrors.length > 0 && (
                  <div
                    className="border-t p-4 text-sm"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  >
                    <h4 className="font-semibold text-red-500 mb-2">
                      Compilation Errors:
                    </h4>
                    {compilationErrors.map((error, index) => (
                      <div key={index} className="text-red-500 text-xs">
                        Line {error.line}: {error.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CodeEditor
