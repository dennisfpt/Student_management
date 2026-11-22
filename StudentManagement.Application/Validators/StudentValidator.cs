using StudentManagement.Domain.Entities;

namespace StudentManagement.Application.Validators
{
    public class StudentValidator : IStudentValidator
    {
        public bool Validate(Student student)
        {
            if (string.IsNullOrWhiteSpace(student.FullName))
                return false;

            if (string.IsNullOrWhiteSpace(student.Email) || !student.Email.Contains("@"))
                return false;

            if (student.Gpa < 0 || student.Gpa > 4.0)
                return false;

            return true;
        }
    }
}