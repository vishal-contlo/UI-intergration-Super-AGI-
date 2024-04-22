'use client'

import { IconOpenAI, IconUser } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { spinner } from './spinner'
import { CodeBlock } from '../ui/codeblock'
import { MemoizedReactMarkdown } from '../markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { StreamableValue, useActions, useUIState } from 'ai/rsc'
import { useStreamableText } from '@/lib/hooks/use-streamable-text'
import ReactDOM from 'react-dom';
import React from 'react';
import { useEffect } from 'react'
import { AI } from '@/lib/chat/actions'


// Different types of message bubbles.

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
        <IconUser />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden pl-2">
        {children}
      </div>
    </div>
  )
}

export function BotMessage({
  content,
  className
}: {
  content: string | StreamableValue<string>
  className?: string
}) {
  const text = useStreamableText(content)
  console.log(content);

  return (
    <div className={cn('group relative flex items-start md:-ml-12', className)}>
      <div className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
        <IconOpenAI />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>
            },
            code({ node, inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == '▍') {
                  return (
                    <span className="mt-1 animate-pulse cursor-default">▍</span>
                  )
                }

                children[0] = (children[0] as string).replace('`▍`', '▍')
              }

              const match = /language-(\w+)/.exec(className || '')

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {text}
        </MemoizedReactMarkdown>
      </div>
    </div>
  )
}

export function BotCard({
  children,
  showAvatar = true
}: {
  children: React.ReactNode
  showAvatar?: boolean
}) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div
        className={cn(
          'flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm',
          !showAvatar && 'invisible'
        )}
      >
        <IconOpenAI />
      </div>
      <div className="ml-4 flex-1 pl-2">{children}</div>
    </div>
  )
}

export interface RandomComponentProps {
  html: string;
  css: string;
  javascript: string;
}

function handleFormSubmission(event: Event) {
  event.preventDefault(); // Prevent the default form submission behavior

  const formData = new FormData(event.target as HTMLFormElement); // Get form data

  // Convert formData.entries() to an array
  const formDataArray = Array.from(formData.entries());
  return formDataArray;

  // Log the form data\
  // formDataArray.map((option, index) => {
  //   return {
  //     [option]: formDataArray[index][option]
  //   }
  // })
  // for (const  [key, value] of formDataArray) {
  //   console.log(`${key}: ${value}`);
  // }

}

export function RandomComponent({ html, css, javascript }: RandomComponentProps) {
  const { submitUserMessage } = useActions();
  const [_, setMessages] = useUIState<typeof AI>();

  useEffect(() => {
    // Ensure the container is ready in the DOM
    const containerReady = setInterval(() => {
      const containerElement = document.getElementById('random-component-container');
      if (containerElement) {
        clearInterval(containerReady);
        initializeComponent(containerElement);
      }
    }, 100); // Check every 100ms

    function initializeComponent(containerElement: HTMLElement) {
      // Insert HTML into the component
      containerElement.insertAdjacentHTML('beforeend', html);

      // Create and append the style element
      const styleElement = document.createElement('style');
      styleElement.textContent = css;
      document.head.appendChild(styleElement);

      // Create and append the script element
      const scriptElement = document.createElement('script');
      scriptElement.textContent = javascript;
      document.body.appendChild(scriptElement);

      // Set up form submission handlers
      setupFormSubmissionHandlers(containerElement);

      // Clean up function
      return () => {
        document.head.removeChild(styleElement);
        document.body.removeChild(scriptElement);
        containerElement.innerHTML = ''; // Clear the container's content
      };
    }

    function setupFormSubmissionHandlers(containerElement: HTMLElement) {
      const forms = containerElement.querySelectorAll('form');
      forms.forEach(form => {
        form.addEventListener('submit', async function(event) {
          event.preventDefault();
          const formElement = event.target as HTMLFormElement;
          const submitButton = formElement.querySelector('button[type="submit"]');
          if (submitButton) {
            (submitButton as HTMLButtonElement).disabled = true;
            submitButton.textContent = 'Processing...';
          }

          const responseMessage = await submitUserMessage(handleFormSubmission(event));
          console.log("Response from submission:", responseMessage);
          setMessages(currentMessages => [...currentMessages, responseMessage]);
        });
      });
    }

    return () => {
      clearInterval(containerReady);
    };
  }, [html, css, javascript]); // Dependencies on external props

  return <div id="random-component-container"></div>;
}





export function SpinnerMessage() {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
        <IconOpenAI />
      </div>
      <div className="ml-4 h-[24px] flex flex-row items-center flex-1 space-y-2 overflow-hidden px-1">
        {spinner}
      </div>
    </div>
  )
}
