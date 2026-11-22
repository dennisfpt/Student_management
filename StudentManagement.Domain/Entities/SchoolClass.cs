namespace StudentManagement.Domain.Entities;

public class SchoolClass
{
    public string Id { get; set; } = string.Empty; // VD: DHTK01
    public string Name { get; set; } = string.Empty; // VD: Bachelor Year 1 - SE
    public string Department { get; set; } = string.Empty;
    public int Capacity { get; set; } = 60;
    public string Status { get; set; } = "Active";
}