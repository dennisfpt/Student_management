namespace StudentManagement.Domain.Entities;

public class Teacher
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty; // Khoa / Bộ môn
    public string PhoneNumber { get; set; } = string.Empty;
}