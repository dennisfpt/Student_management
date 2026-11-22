using StudentManagement.Application.Interfaces;
using StudentManagement.Application.Validators;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Interfaces;

namespace StudentManagement.Application.Services
{
    public class StudentService : IStudentService
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IStudentValidator _validator;
        private readonly ITuitionPolicy _tuitionPolicy;

        public StudentService(
            IStudentRepository studentRepository,
            IStudentValidator validator,
            ITuitionPolicy tuitionPolicy)
        {
            _studentRepository = studentRepository;
            _validator = validator;
            _tuitionPolicy = tuitionPolicy;
        }

        public async Task<bool> RegisterStudentAsync(Student student)
        {
            if (!_validator.Validate(student))
            {
                return false;
            }

            await _studentRepository.AddAsync(student);
            return true;
        }

        public async Task<Student?> GetStudentByIdAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id)) return null;
            return await _studentRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Student>> GetStudentsPagedAsync(int page, int size)
        {
            if (page < 1) page = 1;
            if (size < 1) size = 10;
            return await _studentRepository.GetPageAsync(page, size);
        }

        public decimal CalculateTuition(Student student, decimal baseFee)
        {
            return _tuitionPolicy.CalculateFee(student, baseFee);
        }

        public async Task<bool> UpdateStudentAsync(Student student)
        {
            if (!_validator.Validate(student))
            {
                return false;
            }

            return await _studentRepository.UpdateAsync(student);
        }

        public async Task<bool> DeleteStudentAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return false;
            }

            return await _studentRepository.DeleteAsync(id);
        }
    }
}