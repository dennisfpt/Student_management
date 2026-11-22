using StudentManagement.Domain.Entities;

namespace StudentManagement.Domain.Interfaces
{
    public interface IStudentRepository
    {
        Task AddAsync(Student student);
        Task<Student?> GetByIdAsync(string id);
        Task<IEnumerable<Student>> GetPageAsync(int page, int size);
        IAsyncEnumerable<Student> StreamAllAsync();
        Task<bool> UpdateAsync(Student student);
        Task<bool> DeleteAsync(string id);
    }
}