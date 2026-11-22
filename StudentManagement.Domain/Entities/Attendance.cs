namespace StudentManagement.Domain.Entities;

public class Attendance
{
    public int Id { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Present"; // Present (Có mặt), Excused (Có phép), Absent (Không phép)
    public string Note { get; set; } = string.Empty;
}