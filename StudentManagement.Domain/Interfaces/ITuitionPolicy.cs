
using StudentManagement.Domain.Entities;

namespace StudentManagement.Domain.Interfaces
{
    public interface ITuitionPolicy
    {
        decimal CalculateFee(Student student, decimal baseFee);
    }
}