export interface PlaceTimeSlot {
  startTime: string;
  endTime: string;
}

export interface PlaceDaySchedule {
  open: boolean;
  timeSlots: PlaceTimeSlot[];
}

export interface PlaceDefaultSchedule {
  monday: PlaceDaySchedule;
  tuesday: PlaceDaySchedule;
  wednesday: PlaceDaySchedule;
  thursday: PlaceDaySchedule;
  friday: PlaceDaySchedule;
  saturday: PlaceDaySchedule;
  sunday: PlaceDaySchedule;
}

export interface PlaceCustomDate {
  date: Date;
  open: boolean;
  timeSlots: PlaceTimeSlot[];
}
