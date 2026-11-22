using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Interfaces;

namespace StudentManagement.Application.Policies
{
    public class StandardTuitionPolicy : ITuitionPolicy
    {
        public decimal CalculateFee(Student student, decimal baseFee)
        {
            return baseFee;
        }
    }
}