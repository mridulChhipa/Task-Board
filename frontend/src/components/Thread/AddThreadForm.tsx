import Form, { InputArea } from '../Form/Form';
import Button from '../Button/Button';
import InlineRichTextEditor from '../TextEditor/InlineRichTextEditor';
import type { SubmitEvent, Dispatch, SetStateAction } from 'react';

interface AddThreadProps {
  handleThreadSubmit: (e: SubmitEvent<Element>) => void;
  threadTitle: string;
  setThreadTitle: Dispatch<SetStateAction<string>>;
  threadContent: string;
  setThreadContent: Dispatch<SetStateAction<string>>;
}

export default function AddThreadForm({
  handleThreadSubmit,
  threadTitle,
  setThreadTitle,
  threadContent,
  setThreadContent,
}: AddThreadProps) {
  return (
    <>
      <Form onSubmit={handleThreadSubmit}>
        <InputArea>
          <InlineRichTextEditor
            required={true}
            name="title"
            id="title"
            placeholder="Title"
            value={threadTitle}
            rows={1}
            onChange={(e) => setThreadTitle(e.target.value)}
          />
        </InputArea>
        <InputArea>
          <InlineRichTextEditor
            required={true}
            name="desc"
            id="desc"
            placeholder="Description"
            value={threadContent}
            onChange={(e) => setThreadContent(e.target.value)}
          />
        </InputArea>

        <Button type="submit">Start New Thread</Button>
      </Form>
    </>
  );
}
