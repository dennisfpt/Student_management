namespace StudentManagement.Domain.Entities;

public class UserAccount
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty; // Email đăng nhập
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "Teacher"; // "Admin" hoặc "Teacher"
}