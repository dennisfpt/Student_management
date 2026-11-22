using StudentManagement.Domain.Entities;

namespace StudentManagement.Application.Interfaces
{
    public interface IStudentService
    {
        Task<bool> RegisterStudentAsync(Student student);
        Task<Student?> GetStudentByIdAsync(string id);
        Task<IEnumerable<Student>> GetStudentsPagedAsync(int page, int size);
        decimal CalculateTuition(Student student, decimal baseFee);
        Task<bool> UpdateStudentAsync(Student student);
        Task<bool> DeleteStudentAsync(string id);
    }
}