export default class ToolRegistry {
    constructor(tools = {}, activeToolId = null) {
        this.tools = new Map();
        this.activeToolId = null;

        Object.entries(tools).forEach(([toolId, tool]) => {
            this.registerTool(toolId, tool);
        });

        if (activeToolId) {
            this.setActiveTool(activeToolId);
        }
    }

    registerTool(toolId, tool) {
        if (!toolId || !tool) return false;

        this.tools.set(toolId, tool);

        if (!this.activeToolId) {
            this.activeToolId = toolId;
        }

        return true;
    }

    getTool(toolId) {
        return this.tools.get(toolId) || null;
    }

    getActiveTool() {
        return this.getTool(this.activeToolId);
    }

    getActiveToolId() {
        return this.activeToolId;
    }

    setActiveTool(toolId) {
        if (!this.tools.has(toolId)) return false;

        this.activeToolId = toolId;
        return true;
    }
}
