import { useFormStatus } from "react-dom";
import { useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useActionState } from "react";
import postContact from "../api/postContact";

export const Route = createLazyFileRoute("/contact")({
  component: ContactRoute,
});

function ContactRoute() {
  const [message, setMessage] = useState("");
  const maxLength = 50;

  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      const name = formData.get("name");
      const email = formData.get("email");
      await postContact(name, email, message);
      return { submitted: true };
    },
    { submitted: false, error: null },
  );

  const handleTextareaChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
    }
  };

  return (
    <div className="contact">
      {isPending ? <h2>Submitting...</h2> : <h2>Contact</h2>}
      {state.submitted ? (
        <h3>Submitted!</h3>
      ) : (
        <>
          { isPending && <div className="loader"></div>}
          <form action={formAction}>
            <ContactInput
              name="name"
              type="text"
              placeholder="Name"
              isPending={isPending}
            />
            <ContactInput
              name="email"
              type="email"
              placeholder="Email"
              isPending={isPending}
            />
            <ContactTextArea
              name="message"
              placeholder="Message"
              value={message}
              onChange={handleTextareaChange}
              maxLength={maxLength}
              isPending={isPending}
            />
            <p>
              {message.length}/{maxLength} characters
            </p>
            <SubmitButton isPending={isPending} />
          </form>
        </>
      )}
    </div>
  );
}

function ContactInput({ isPending, ...props }) {
  return <input disabled={isPending} required {...props} />;
}

function ContactTextArea({ value, onChange, maxLength, isPending, ...props }) {
  return (
    <textarea
      disabled={isPending}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      rows={5}
      required
      {...props}
    />
  );
}

function SubmitButton({ isPending }) {

  return (
    <button type="submit" disabled={isPending}>
      { isPending ? "Submitting..." : "Submit"}
    </button>
  );
}
