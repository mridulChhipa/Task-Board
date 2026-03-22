import { useRef, useEffect } from 'react';
import type { MouseEvent } from 'react';
import styles from './InlineRichTextEditor.module.css';

export interface InlineRichTextEditorProps {
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  rows?: number;
  placeholder?: string;
  name?: string;
  id?: string;
  required?: boolean;
}

export default function InlineRichTextEditor({
  value = '',
  onChange,
  onBlur,
  onKeyDown,
  rows,
  // required,
  id,
  // name,
  placeholder,
}: InlineRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;

      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [value]);

  const handleInput = (): void => {
    const element = editorRef.current;
    if (!element) {
      return;
    }

    const html = element.innerHTML;
    const text = element.textContent?.trim() ?? '';

    const isEmpty =
      text === '' || html === '<br>' || html === '<div><br></div>';

    if (isEmpty) {
      element.setAttribute('data-empty', 'true');
    } else {
      element.removeAttribute('data-empty');
    }

    if (onChange) {
      onChange({
        target: {
          value: isEmpty ? '' : html,
        },
      });
    }
  };

  const formatText = (command: string): void => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.extractContents();

    let wrapper: HTMLElement;

    switch (command) {
      case 'bold':
        wrapper = document.createElement('b');
        break;
      case 'italic':
        wrapper = document.createElement('i');
        break;
      case 'underline':
        wrapper = document.createElement('u');
        break;
      default:
        return;
    }

    wrapper.appendChild(selectedText);
    range.insertNode(wrapper);

    selection.removeAllRanges();
    selection.addRange(range);

    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>): void => {
    e.preventDefault();

    const text = e.clipboardData.getData('text/plain');

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);

    range.deleteContents();
    range.insertNode(document.createTextNode(text));

    range.collapse(false);
  };

  const dynamicMinHeight = rows ? `${rows * 24}px` : '96px';

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button
          onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            formatText('bold');
          }}
          className={styles.button}
          type="button"
          title="Bold"
        >
          <b>B</b>
        </button>
        <button
          onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            formatText('italic');
          }}
          className={styles.button}
          type="button"
          title="Italic"
        >
          <i>I</i>
        </button>
        <button
          onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            formatText('underline');
          }}
          className={styles.button}
          type="button"
          title="Underline"
        >
          <u>U</u>
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleInput}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        data-empty={true}
        className={styles.editableArea}
        style={{ minHeight: dynamicMinHeight }}
        id={id}
      />
    </div>
  );
}
