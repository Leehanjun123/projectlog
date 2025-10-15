'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-lg prose-blockquote:border-l-purple-500 prose-blockquote:bg-purple-50 prose-blockquote:py-1 prose-strong:text-gray-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // 코드 블록 스타일링
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code className="text-purple-600 bg-purple-50 px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          },
          // 링크 새 탭에서 열기
          a({ node, children, href, ...props }: any) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            )
          },
          // 이미지 최적화
          img({ node, src, alt, ...props }: any) {
            return (
              <img src={src} alt={alt} className="rounded-lg max-w-full h-auto" {...props} />
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
