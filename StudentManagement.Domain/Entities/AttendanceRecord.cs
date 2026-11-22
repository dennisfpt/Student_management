namespace StudentManagement.Domain.Entities;

public class AttendanceRecord
{
    public int Id { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Present"; // Present, Absent, Late
    public string? Note { get; set; }
}