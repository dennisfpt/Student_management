using StudentManagement.Domain.Entities;

namespace StudentManagement.Domain.Interfaces;

public interface IGradeRepository
{
    Task<IEnumerable<Grade>> GetAllAsync();
    Task<IEnumerable<Grade>> GetByStudentIdAsync(string studentId);
    Task<Grade?> GetByIdAsync(int id);
    Task AddAsync(Grade grade);
    Task<bool> UpdateAsync(Grade grade);
    Task<bool> DeleteAsync(int id);
}