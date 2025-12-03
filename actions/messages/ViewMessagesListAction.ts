import {
  IMessageRepository,
  MessageFilters,
} from "../../repositories/messages/IMessageRepository";
import { IMessage } from "../../types/models/message";

export interface IViewMessagesListAction {
  execute(params: {
    filters?: MessageFilters;
    project?: (keyof IMessage)[];
  }): Promise<IMessage[] | Partial<IMessage>[]>;
}

const ViewMessagesListAction = (
  messageRepository: IMessageRepository
): IViewMessagesListAction => ({
  execute: async ({ filters, project }) => {
    // If no project specified, return all fields by default
    const defaultProject: (keyof IMessage)[] = [
      "_id",
      "author",
      "content",
      "reference",
      "referenceType",
      "createdAt",
      "updatedAt",
    ];

    const messages = await messageRepository.findAll({
      filters,
      project: project || defaultProject,
    });
    return messages;
  },
});

export default ViewMessagesListAction;
