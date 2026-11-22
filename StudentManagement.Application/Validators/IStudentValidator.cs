using StudentManagement.Domain.Entities;

namespace StudentManagement.Application.Validators
{
    public interface IStudentValidator
    {
        bool Validate(Student student);
    }
}