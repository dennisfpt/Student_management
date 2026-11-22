using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Interfaces;

namespace StudentManagement.Application.Policies
{
    // Đổi tên class tại dòng này thành ScholarshipTuitionPolicy
    public class ScholarshipTuitionPolicy : ITuitionPolicy
    {
        public decimal CalculateFee(Student student, decimal baseFee)
        {
            if (student.Gpa >= 3.6)
            {
                return baseFee * 0.5m;
            }

            return baseFee * 0.8m;
        }
    }
}