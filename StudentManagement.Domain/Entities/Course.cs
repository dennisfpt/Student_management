namespace StudentManagement.Domain.Entities;

public class Course
{
    public string Id { get; set; } = string.Empty; // Mã môn (VD: PROG101)
    public string Title { get; set; } = string.Empty; // Tên môn học
    public int Credits { get; set; } = 15; // Số tín chỉ
    public string LecturerName { get; set; } = string.Empty; // Giảng viên phụ trách
    public string Status { get; set; } = "Đang mở lớp"; // Trạng thái
}