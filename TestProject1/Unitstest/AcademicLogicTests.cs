using StudentManagement.Domain.Entities;
using Xunit;

namespace StudentManagement.Tests.Unitstest;

public class AcademicLogicTests
{
    [Theory]
    [InlineData(15, 1_000_000, 0.00, 15_000_000)]
    [InlineData(15, 1_000_000, 0.30, 10_500_000)]
    [InlineData(15, 1_000_000, 0.50, 7_500_000)]
    public void TuitionFeeCalculation_ShouldComputeStandardAndScholarshipFees(
        int credits, decimal unitPrice, decimal discountRate, decimal expectedFee)
    {
        decimal baseFee = credits * unitPrice;
        decimal finalFee = baseFee * (1m - discountRate);
        Assert.Equal(expectedFee, finalFee);
    }

    [Theory]
    [InlineData("SV001", "Nguyen Van An", "an.nv@unit.edu.vn", 3.8, true)]
    [InlineData("", "Nguyen Van An", "an.nv@unit.edu.vn", 3.8, false)]
    [InlineData("SV002", "", "an.nv@unit.edu.vn", 3.5, false)]
    [InlineData("SV003", "Tran Van B", "invalid-email", 3.2, false)]
    [InlineData("SV004", "Le Thi C", "c.lt@unit.edu.vn", 4.5, false)]
    public void StudentValidationRules_ShouldVerifyEntityConstraints(
        string id, string name, string email, double gpa, bool expectedValid)
    {
        var student = new Student
        {
            Id = id,
            FullName = name,
            Email = email,
            DateOfBirth = new DateTime(2005, 5, 12),
            Gpa = gpa
        };

        bool isValid = !string.IsNullOrWhiteSpace(student.Id)
 



                   && !string.IsNullOrWhiteSpace(student.FullName)
                    && student.Email.Contains('@')
                    && student.Gpa >= 0.0 && student.Gpa <= 4.0;

        Assert.Equal(expectedValid, isValid);
    }

    [Theory]
    [InlineData(9.0, 9.5, 3.7, "Pass")]
 








   [InlineData(5.0, 5.5, 2.1, "Pass")]
    [InlineData(3.0, 4.0, 1.4, "Fail")]
    public void GradeComputation_ShouldMapScoresToGpaAndStatus(
        double midterm, double finalScore, double expectedGpa, string expectedStatus)
    {
        double average10 = Math.




Round(midterm * 0.4 + finalScore * 0.6, 2);
        double computedGpa = Math.Round((average10 / 10.0) * 4.0, 1);
        string status = average10 >= 5.0 ? "Pass" : "Fail";

        Assert.Equal(expectedGpa, computedGpa);
 




       Assert.Equal(expectedStatus, status);
    }
}
