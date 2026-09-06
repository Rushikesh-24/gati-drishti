export interface Train {
  id: string;
  number: string;
  name: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  isDemo?: boolean;
}

// RailYatri API response shapes
export interface RailYatriTrain {
  train_number: string;
  train_name: string;
  eng_train_name: string;
  new_train_number: string;
  is_fav: boolean;
  src_stn_code: string;
  src_stn_name: string;
  dstn_stn_code: string;
  dstn_stn_name: string;
}

export interface RailYatriSearchResponse {
  success: boolean;
  trains?: RailYatriTrain[];
}
