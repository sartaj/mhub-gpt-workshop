import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import csv from "csvtojson";
import path from "path";
import { useEffect, useState } from "react";
import { Table } from "~/modules/Table";
import { runGPT } from "~/modules/gpt-script-runner.server";

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export const loader = async () => {
  const jsonArray = await csv().fromFile(
    path.join(__dirname, "../../db/sample_data.csv")
  );

  return json(jsonArray);
};

interface ActionData {
  error?: string;
  data?: string;
  prompt?: string;
}

export async function action({ request }: ActionArgs) {
  const form = await request.formData();
  const prompt = form.get("prompt");

  // validate the fields
  if (typeof prompt !== "string") {
    return json<ActionData>({ error: "input required" }, { status: 422 });
  }

  const data = await runGPT(prompt);

  return json<ActionData>({ data, prompt }, { status: 422 });
}

const ResponseDebugLog = ({ data }: { data?: string }) => {
  const [show, setShow] = useState(false);
  if (!data) {
    return <></>;
  }
  const logs = data.split("\n").filter((line) => {
    if (line.startsWith(">")) {
      return false;
    }
    return true;
  });
  if (show === false) {
    return <button onClick={() => setShow(true)}>See Logs</button>;
  }
  return (
    <div className="my-2 p-2 rounded-sm text-sm bg-slate-200">
      <code>
        {logs.map((s, i) => (
          <div key={i}>{s}</div>
        ))}
      </code>
      <button onClick={() => setShow(false)}>Hide Logs</button>
    </div>
  );
};

const ChatLogs = ({
  chatLogs,
}: {
  chatLogs: {
    isBot: boolean;
    text: string;
    logs?: string;
  }[];
}) => {
  const transition = useTransition();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {chatLogs.map((message, index) => (
          <div
            key={index}
            className={`flex my-2 ${
              message.isBot ? "justify-start" : "justify-end"
            }`}
          >
            <div className={`max-w-xs ${message.isBot ? "ml-2" : "mr-2 "}`}>
              <p
                className={`${
                  message.isBot ? "bg-gray-200" : "bg-blue-700 text-white"
                } rounded-lg p-3`}
              >
                {message.text}
              </p>
              {message.logs && <ResponseDebugLog data={message.logs} />}
            </div>
          </div>
        ))}
        {transition.state === "submitting" && (
          <div className={`flex my-2  justify-start`}>
            <div className={`max-w-xs "ml-2`}>
              <p className="bg-gray-200 rounded-lg p-3">
                Researching Your Question...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatWidget = () => {
  const actionData = useActionData<typeof action>();
  const [input, setInput] = useState("");

  const [chatLogs, setChatLogs] = useState<
    {
      isBot: boolean;
      text: string;
      logs?: string;
    }[]
  >([]);

  useEffect(() => {
    if (actionData?.data) {
      const finalAnswer =
        actionData.data
          .split("\n")
          .find((line) => line.startsWith("Final Answer"))
          ?.replace("Final Answer: ", "") || "No answer found.";

      setChatLogs([
        ...chatLogs,
        { text: finalAnswer, isBot: true, logs: actionData.data },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData?.data]);
  return (
    <div>
      <Form
        method="post"
        className="flex p-4"
        onSubmit={() => {
          setChatLogs([...chatLogs, { isBot: false, text: input }]);
          setInput("");
        }}
      >
        <input
          type="text"
          name="prompt"
          placeholder="Ask your question"
          className="flex-1 rounded-full py-2 px-4 mr-4"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {actionData?.error ? <span>{actionData.error}</span> : null}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 rounded-full py-2 px-4 text-white"
        >
          Ask our AI
        </button>
      </Form>
      <ChatLogs chatLogs={chatLogs} />
    </div>
  );
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="flex flex-row">
        <div className="w-full md:w-2/3 p-4">
          <Table data={data} itemsPerPage={50} />
        </div>
        <div className="w-full md:w-1/3 p-4 max-w-400 mx-auto bg-sky-200">
          <ChatWidget />
        </div>
      </div>
    </div>
  );
}
