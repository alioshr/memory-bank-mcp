import {
  makeListProjectFilesController,
  makeListProjectsController,
  makeReadController,
  makeUpdateController,
  makeWriteController,
} from "../../factories/controllers/index.js";
import { adaptMcpRequestHandler } from "./adapters/mcp-request-adapter.js";
import { McpRouterAdapter } from "./adapters/mcp-router-adapter.js";

export default () => {
  const router = new McpRouterAdapter();

  router.setTool({
    schema: {
      name: "list_projects",
      description: "List all projects in the memory bank",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
      annotations: {
        title: "List Projects",
        readOnlyHint: true,
      },
    },
    handler: adaptMcpRequestHandler(makeListProjectsController()),
  });

  router.setTool({
    schema: {
      name: "list_project_files",
      description: "List all files within a specific project",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
        },
        required: ["projectName"],
      },
      annotations: {
        title: "List Project Files",
        readOnlyHint: true,
      },
    },
    handler: adaptMcpRequestHandler(makeListProjectFilesController()),
  });

  router.setTool({
    schema: {
      name: "memory_bank_read",
      description: "Read a memory bank file for a specific project",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
          fileName: {
            type: "string",
            description: "The name of the file",
          },
        },
        required: ["projectName", "fileName"],
      },
      annotations: {
        title: "Read Memory Bank",
        readOnlyHint: true,
      },
    },
    handler: adaptMcpRequestHandler(makeReadController()),
  });

  router.setTool({
    schema: {
      name: "memory_bank_write",
      description: "Create a new memory bank file for a specific project",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
          fileName: {
            type: "string",
            description: "The name of the file",
          },
          content: {
            type: "string",
            description: "The content of the file",
          },
        },
        required: ["projectName", "fileName", "content"],
      },
      annotations: {
        title: "Write Memory Bank",
        destructiveHint: false,
      },
    },
    handler: adaptMcpRequestHandler(makeWriteController()),
  });

  router.setTool({
    schema: {
      name: "memory_bank_update",
      description: "Update an existing memory bank file for a specific project",
      inputSchema: {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "The name of the project",
          },
          fileName: {
            type: "string",
            description: "The name of the file",
          },
          content: {
            type: "string",
            description: "The content of the file",
          },
        },
        required: ["projectName", "fileName", "content"],
      },
      annotations: {
        title: "Update Memory Bank",
        destructiveHint: true,
      },
    },
    handler: adaptMcpRequestHandler(makeUpdateController()),
  });

  return router;
};
