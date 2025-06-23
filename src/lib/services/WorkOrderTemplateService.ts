
import { WorkOrderTemplateRepository, WorkOrderTemplate } from '@/lib/database/repositories/WorkOrderTemplateRepository';

export class WorkOrderTemplateService {
  private repository: WorkOrderTemplateRepository;

  constructor() {
    this.repository = new WorkOrderTemplateRepository();
  }

  async getActiveTemplates(): Promise<WorkOrderTemplate[]> {
    try {
      return await this.repository.findActive();
    } catch (error) {
      console.error('Error fetching active templates:', error);
      throw new Error('Failed to fetch work order templates');
    }
  }

  async getTemplatesByCategory(categoryId: string): Promise<WorkOrderTemplate[]> {
    try {
      return await this.repository.findByCategory(categoryId);
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      throw new Error('Failed to fetch templates for category');
    }
  }

  async createTemplate(templateData: Partial<WorkOrderTemplate>): Promise<WorkOrderTemplate> {
    try {
      const template = await this.repository.create({
        ...templateData,
        is_active: true,
        usage_count: 0,
        parts_list: templateData.parts_list || []
      });
      return template;
    } catch (error) {
      console.error('Error creating template:', error);
      throw new Error('Failed to create work order template');
    }
  }

  async useTemplate(templateId: string): Promise<WorkOrderTemplate> {
    try {
      return await this.repository.incrementUsage(templateId);
    } catch (error) {
      console.error('Error incrementing template usage:', error);
      throw new Error('Failed to update template usage');
    }
  }

  async getMostUsedTemplates(limit: number = 10): Promise<WorkOrderTemplate[]> {
    try {
      return await this.repository.getMostUsed(limit);
    } catch (error) {
      console.error('Error fetching most used templates:', error);
      throw new Error('Failed to fetch popular templates');
    }
  }

  async updateTemplate(id: string, updates: Partial<WorkOrderTemplate>): Promise<WorkOrderTemplate> {
    try {
      return await this.repository.update(id, updates);
    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update work order template');
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw new Error('Failed to delete work order template');
    }
  }
}
