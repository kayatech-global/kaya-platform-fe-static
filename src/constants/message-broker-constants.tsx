import { ReactNode } from 'react';

const structurePlaceholder = `{
  "headers": {
    "message_id": Variable:message_id,
    "session_id": Metadata:session_id,
    "workflow_id": Metadata:workflow_id,
    "created_at": Metadata:created_at
  },
  "payload": {
    "input": {
      "variables": {
        "file_path": Variable:file_path,
        "roster_type": Variable:roster_type,
        "delegated": Variable:delegated,
        "hospital_system": Variable:hospital_system,
        "external_reference_id": Variable:external_reference_id
      },
      "message": "Metadata:message"
    }
  }
}`;

const helperInfo = `• Initial workflow trigger: Workflow ID, Message Type and Message attribute are required, Session ID is optional
• Resume workflow (after self-learning or HITL): Session ID, Message Type and Message attribute are required
• Publish self-learning or HITL request: Session ID, Message Type and Message attribute are required
• Publish to external systems: Session ID, Message Type and Message attribute are required`;

const tooltip = (
    <ul className="list-disc pl-4 space-y-1 pt-2 pb-2">
        <li>
            <b className="text-blue-500">Inbound -</b> Initial workflow trigger: <b>Workflow ID</b>, <b>Message Type</b> and <b>Message attribute</b> are required, Session ID is optional
        </li>
        <li>
            <b className="text-blue-500">Inbound -</b> Resume workflow (after self-learning or HITL): <b>Session ID</b>, <b>Message Type</b>
             {''} and <b>Message attribute</b> are required
        </li>
        <li>
            <b className="text-amber-500">Outbound -</b> Publish self-learning or HITL request: <b>Session ID</b>, <b>Message Type</b>
            {''} and <b>Message attribute</b> are required
        </li>
        <li>
            <b className="text-amber-500">Outbound -</b> Publish to external systems: <b>Session ID</b>, <b>Message Type</b> and{' '}
            <b>Message attribute</b> are required
        </li>
    </ul>
);

interface IMessageBrokerTopicContent {
    messageBrokerTopic: {
        structurePlaceholder: string;
        helperInfo: string;
        tooltip: ReactNode;
    };
    selfLearningTopic: {
        publisher: {
            structurePlaceholder: string;
            helperInfo: string;
            tooltip: ReactNode;
        };
        consumer: {
            structurePlaceholder: string;
            helperInfo: string;
            tooltip: ReactNode;
        };
    };
    humanInputTopic: {
        publisher: {
            structurePlaceholder: string;
            helperInfo: string;
            tooltip: ReactNode;
        };
        consumer: {
            structurePlaceholder: string;
            helperInfo: string;
            tooltip: ReactNode;
        };
    };
}

export const MESSAGE_BROKER_TOPIC_CONTENT: IMessageBrokerTopicContent = {
    messageBrokerTopic: {
        structurePlaceholder,
        helperInfo,
        tooltip,
    },
    selfLearningTopic: {
        publisher: {
            structurePlaceholder,
            helperInfo,
            tooltip,
        },
        consumer: {
            structurePlaceholder,
            helperInfo,
            tooltip,
        },
    },
    humanInputTopic: {
        publisher: {
            structurePlaceholder,
            helperInfo,
            tooltip,
        },
        consumer: {
            structurePlaceholder,
            helperInfo,
            tooltip,
        },
    },
};
