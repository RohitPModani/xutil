import { useState, type FormEvent } from 'react';
import { Button, Callout, Dialog, Field, Input, TextArea } from '../ui';

interface RequestToolDialogProps {
  open: boolean;
  onClose: () => void;
}

const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScJwt5CkRpu-w77-B6EVhwWV5iTJqH08ysxcROyTZ6eWu9KHg/formResponse';

export function RequestToolDialog({ open, onClose }: RequestToolDialogProps) {
  const [name, setName] = useState('');
  const [tool, setTool] = useState('');
  const [desc, setDesc] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const close = () => {
    setState('idle');
    onClose();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    // Google Forms sends no CORS headers, so the response is opaque. A network
    // failure still rejects, which is the only failure we can detect.
    if (navigator.onLine === false) {
      setState('error');
      return;
    }
    const body = new URLSearchParams({
      'entry.112796009': name,
      'entry.1057890448': tool,
      'entry.1291570962': desc,
    });
    try {
      setState('sending');
      await fetch(FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      setState('sent');
      setName('');
      setTool('');
      setDesc('');
    } catch {
      setState('error');
    }
  };

  return (
    <Dialog open={open} onClose={close} title="Request a tool">
      {state === 'sent' ? (
        <div className="space-y-4">
          <Callout tone="success">Sent. Thanks, we will take a look.</Callout>
          <div className="flex justify-end">
            <Button variant="primary" onClick={close}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Your name" htmlFor="req-name">
            <Input id="req-name" mono={false} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
          </Field>
          <Field label="Tool name" htmlFor="req-tool">
            <Input id="req-tool" mono={false} required value={tool} onChange={(e) => setTool(e.target.value)} placeholder="JSON to Go struct" />
          </Field>
          <Field label="What should it do?" htmlFor="req-desc">
            <TextArea id="req-desc" mono={false} autoSize={false} rows={4} required value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Takes a JSON object and returns the Go struct for it." />
          </Field>
          {state === 'error' && <Callout tone="error">Could not send. Check your connection and try again.</Callout>}
          <div className="flex justify-end gap-2">
            <Button onClick={close}>Cancel</Button>
            <Button type="submit" variant="primary" loading={state === 'sending'}>
              Send request
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
