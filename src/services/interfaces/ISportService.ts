import { Sport, SportQueryFilters } from "../../models/Sport";

// Sports have no screen of their own (HU-GD-01 is backend only); the views use
// this service only to fill the sport selectors.
export interface ISportService {
  getAll(filters?: SportQueryFilters): Promise<Sport[]>;
}
