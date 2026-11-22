using StudentManagement.Domain.Entities;

namespace StudentManagement.Domain.Interfaces;

public interface IAttendanceRepository
{
    Task<IEnumerable<Attendance>> GetAllAsync();
    Task<IEnumerable<Attendance>> GetByCourseAsync(string courseId);
    Task<IEnumerable<Attendance>> GetByStudentAsync(string studentId);
    Task AddAsync(Attendance attendance);
    Task<bool> UpdateAsync(Attendance attendance);
    Task<bool> DeleteAsync(int id);
}