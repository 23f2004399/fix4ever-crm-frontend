export interface CaptainPersonalInfo {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  residentialAddress: string;
  latitude?: number;
  longitude?: number;
}

export interface CaptainVehicle {
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  licensePlate: string;
  vehicleColor: string;
  registrationCertificate: string;
  insuranceDocument: string;
  vehiclePhotos: string[];
}

export interface CaptainLicense {
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
  licenseClass: string;
  licensePhoto: string;
  isCommercial: boolean;
}

export interface CaptainIdentity {
  governmentIdType: string;
  governmentIdNumber: string;
  governmentIdProof: string;
  selfieVerification: string;
  verificationStatus: "Pending" | "Verified" | "Rejected";
}

export interface CaptainBank {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountType: string;
  cancelledCheque?: string;
}

export interface CaptainServicePrefs {
  workingHours: { start: string; end: string };
  workingDays: string[];
  serviceAreas: string[];
  maxTravelDistance: number;
  vehicleCapacityKg: number;
  specialHandling: string[];
}

export interface Captain {
  _id: string;
  personalInfo: CaptainPersonalInfo;
  vehicleDetails: CaptainVehicle;
  drivingLicenseDetails: CaptainLicense;
  identityVerification: CaptainIdentity;
  bankDetails: CaptainBank;
  servicePreferences: CaptainServicePrefs;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    drivingSkill: number;
    communication: number;
    punctuality: number;
    carefulness: number;
    overallExperience: number;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated?: string;
  };
  availability: "Available" | "On Trip" | "Offline";
  onboardingStatus:
    | "Not Started"
    | "In Progress"
    | "In Review"
    | "Approved"
    | "Rejected";
  submittedAt?: string;
  reviewedAt?: string;
  reviewComments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaptainWallet {
  _id: string;
  captainId: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingSettlement: number;
  availableBalance: number;
  isActive: boolean;
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
    upiId?: string;
  };
}

export interface CaptainTransaction {
  _id: string;
  captainId: string;
  serviceRequestId?: string;
  type: "credit" | "debit" | "settlement" | "refund" | "adjustment";
  category: "trip_earning" | "withdrawal";
  amount: number;
  netAmount: number;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  metadata?: { tripType?: "pickup" | "drop"; serviceType?: string };
  createdAt: string;
}

export interface CaptainSettlement {
  _id: string;
  captainId: string;
  amount: number;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "processing"
    | "completed"
    | "failed";
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  completedAt?: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    upiId?: string;
  };
  transactionReference?: string;
  notes?: string;
}

export interface CaptainStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  available: number;
  onTrip: number;
}
