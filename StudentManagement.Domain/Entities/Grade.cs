namespace StudentManagement.Domain.Entities;

public class Grade
{
    public int Id { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public double MidtermScore { get; set; }  // Điểm quá trình
    public double FinalScore { get; set; }    // Điểm thi kết thúc
    public double TotalGpa { get; set; }      // Điểm hệ 4 hoặc tổng kết
    public string Status { get; set; } = "Pass"; // Pass / Fail
}