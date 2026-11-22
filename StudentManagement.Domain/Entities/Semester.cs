namespace StudentManagement.Domain.Entities;

public class Semester
{
    public string Id { get; set; } = string.Empty; // VD: HK1-2026
    public string Name { get; set; } = string.Empty; // VD: Fall Semester 2026
    public string AcademicYear { get; set; } = string.Empty; // VD: 2026 - 2027
    public string Status { get; set; } = "Ongoing"; // Ongoing, Upcoming, Concluded
}