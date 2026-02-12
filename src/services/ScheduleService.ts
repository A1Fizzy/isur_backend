import { ScheduleEntry } from "../repositories/ScheduleRepository";
import { GetScheduleOptions } from "../repositories/ScheduleRepository";
import { ScheduleRepository } from "../repositories/ScheduleRepository";

export class ScheduleService {
  private repository: ScheduleRepository;

  constructor() {
    this.repository = new ScheduleRepository();
  }

  async getSchedule(options: GetScheduleOptions): Promise<ScheduleEntry[]> {
    return await this.repository.getSchedule(options);
  }
}

export { GetScheduleOptions };
