import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  isRtl: boolean
}

export function MarkdownRenderer({ content, isRtl }: MarkdownRendererProps) {
  const components: Components = {
    h1: ({ children }) => (
      <h1 style={{ fontFamily: 'var(--font-lora)', fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px' }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 style={{ fontFamily: 'var(--font-lora)', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: '12px 0 6px' }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ fontFamily: 'var(--font-lora)', fontSize: '13px', fontWeight: 600, color: 'var(--accent)', margin: '10px 0 4px' }}>
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p style={{ marginBottom: '8px', color: 'var(--ink)' }}>{children}</p>
    ),
    ul: ({ children }) => (
      <ul style={{ paddingRight: isRtl ? '20px' : '0', paddingLeft: isRtl ? '0' : '20px', marginBottom: '8px' }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol style={{ paddingRight: isRtl ? '20px' : '0', paddingLeft: isRtl ? '0' : '20px', marginBottom: '8px' }}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li style={{ marginBottom: '4px', color: 'var(--ink)' }}>{children}</li>
    ),
    code: ({ className, children, ...props }) => {
      const isBlock = className?.startsWith('language-')
      if (isBlock) {
        return (
          <pre style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--accent)', margin: '8px 0', direction: 'ltr', textAlign: 'left', overflowX: 'auto' }}>
            <code className={className}>{children}</code>
          </pre>
        )
      }
      return (
        <code style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 5px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--accent)', direction: 'ltr', display: 'inline-block' }} {...props}>
          {children}
        </code>
      )
    },
    table: ({ children }) => (
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '12px', fontSize: '13px' }}>
        {children}
      </table>
    ),
    th: ({ children }) => (
      <th style={{ border: '1px solid var(--border)', padding: '6px 10px', background: 'var(--surface-alt)', fontWeight: 600, textAlign: isRtl ? 'right' : 'left' }}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td style={{ border: '1px solid var(--border)', padding: '6px 10px', textAlign: isRtl ? 'right' : 'left' }}>
        {children}
      </td>
    ),
    blockquote: ({ children }) => (
      <blockquote style={{ borderRight: isRtl ? '3px solid var(--border-strong)' : 'none', borderLeft: isRtl ? 'none' : '3px solid var(--border-strong)', paddingRight: isRtl ? '12px' : '0', paddingLeft: isRtl ? '0' : '12px', margin: '8px 0', color: 'var(--muted)', fontStyle: 'italic' }}>
        {children}
      </blockquote>
    ),
    hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />,
  }

  return (
    <div
      style={{
        direction: isRtl ? 'rtl' : 'ltr',
        lineHeight: '1.7',
        fontSize: '14px',
        color: 'var(--ink)',
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
