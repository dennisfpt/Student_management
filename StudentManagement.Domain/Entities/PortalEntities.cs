namespace StudentManagement.Domain.Entities;

public class ClassSection
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Department { get; set; } = "";
    public string LecturerId { get; set; } = "";
    public string LecturerName { get; set; } = "";
    public int MaxCapacity { get; set; } = 30;
    public string Status { get; set; } = "Active";
}

public class StudentProfile
{
    public string Email { get; set; } = "";
    public string StudentId { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Major { get; set; } = "";
    public string AvatarBase64 { get; set; } = "";
}

public class TuitionInvoice
{
    public string Id { get; set; } = "";
    public string StudentEmail { get; set; } = "ALL";
    public string Semester { get; set; } = "";
    public int Credits { get; set; }
    public decimal AmountVnd { get; set; }
    public string Note { get; set; } = "";
    public string BankCode { get; set; } = "MB";
    public string AccountNo { get; set; } = "0865156242";
    public string AccountName { get; set; } = "DUONG THI KIM YEN";
    public bool Paid { get; set; }
    public string CreatedAt { get; set; } = "";
    public string RecipientEmailsJson { get; set; } = "[]";
}

public class Announcement
{
    public string Id { get; set; } = "";
    public string Category { get; set; } = "Academic";
    public string TargetGroup { get; set; } = "ALL";
    public string TargetClassIdsJson { get; set; } = "[]";
    public string Title { get; set; } = "";
    public string Message { get; set; } = "";
    public string InvoiceId { get; set; } = "";
    public decimal AmountVnd { get; set; }
    public string CreatedAt { get; set; } = "";
}

public class SupportTicket
{
    public string Id { get; set; } = "";
    public string StudentId { get; set; } = "";
    public string StudentName { get; set; } = "";
    public string StudentEmail { get; set; } = "";
    public string Category { get; set; } = "";
    public string Subject { get; set; } = "";
    public string Description { get; set; } = "";
    public string Status { get; set; } = "Pending";
    public string AdminReply { get; set; } = "";
    public string CreatedAt { get; set; } = "";
    public string UpdatedAt { get; set; } = "";
}

public class PortalAssignment
{
    public string Id { get; set; } = "";
    public string ClassId { get; set; } = "";
    public string CourseName { get; set; } = "";
    public string LecturerName { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string DueDate { get; set; } = "";
    public string CreatedAt { get; set; } = "";
    public string SubmissionsJson { get; set; } = "[]";
}

public class AttendanceSummary
{
    public int Id { get; set; }
    public string StudentId { get; set; } = "";
    public string StudentName { get; set; } = "";
    public string ClassId { get; set; } = "";
    public int TotalSessions { get; set; } = 15;
    public int AttendedSessions { get; set; } = 15;
    public int AbsentSessions { get; set; } = 0;
    public string UpdatedBy { get; set; } = "";
    public string UpdatedAt { get; set; } = "";
}

public class ScholarshipAward
{
    public string StudentId { get; set; } = "";
    public string StudentName { get; set; } = "";
    public string Major { get; set; } = "";
    public string ClassId { get; set; } = "";
    public double Gpa { get; set; }
    public string Tier { get; set; } = "";
    public decimal WaiverAmountVnd { get; set; }
    public string AwardedAt { get; set; } = "";
}

public class CampusEvent
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Organizer { get; set; } = "";
    public string EventDate { get; set; } = "";
    public string Venue { get; set; } = "";
    public int ConductPoints { get; set; } = 5;
    public string Status { get; set; } = "Upcoming";
    public string AttendeesJson { get; set; } = "[]";
}

public class AuditLog
{
    public string Id { get; set; } = "";
    public string Actor { get; set; } = "";
    public string Action { get; set; } = "";
    public string Target { get; set; } = "";
    public string Detail { get; set; } = "";
    public string Timestamp { get; set; } = "";
}