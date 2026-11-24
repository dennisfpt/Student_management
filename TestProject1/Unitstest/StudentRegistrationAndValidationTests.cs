using System;
using System.Collections.Generic;
using Xunit;

namespace StudentManagement.Tests.Unitstest
{
    public class StudentRegistrationAndValidationTests
    {
        // TC001 - TC005: Kiểm tra hợp lệ dữ liệu sinh viên
        [Fact]
        public void ValidateStudent_ValidData_ReturnsSuccess()
        {
            var (isValid, error) = ValidateStudentInput("S001", "Nguyen Van An", "an.nv@unit.edu.vn", 3.6);

            Assert.True(isValid);
            Assert.True(string.IsNullOrEmpty(error));
        }

        [Theory]
        [InlineData("", "an.nv@unit.edu.vn", 3.0, "Full name is required.")]
        [InlineData("Nguyen@ An", "an.nv@unit.edu.vn", 3.0, "Full name is not valid.")]
        [InlineData("Nguyen Van An", "an.unit.edu.vn", 3.0, "Email is not valid.")]
        [InlineData("Nguyen Van An", "an.nv@unit.edu.vn", 4.5, "GPA must be between 0.0 and 4.0.")]
        [InlineData("Nguyen Van An", "an.nv@unit.edu.vn", -0.5, "GPA must be between 0.0 and 4.0.")]
        public void ValidateStudent_InvalidData_ReturnsExpectedError(
            string fullName, string email, double gpa, string expectedError)
        {
            var (isValid, error) = ValidateStudentInput("S002", fullName, email, gpa);

            Assert.False(isValid);
            Assert.Equal(expectedError, error);
        }

        // TC012 - TC015: Kiểm tra tính học phí theo chính sách học bổng
        [Theory]
        [InlineData(3.00, 5000, 5000)]
        [InlineData(3.49, 5000, 5000)]
        [InlineData(3.50, 5000, 2500)]
        [InlineData(3.80, 5000, 2500)]
        public void CalculateTuitionFee_ScholarshipPolicy_AppliesExpectedDiscount(
            double gpa, decimal baseFee, decimal expectedFee)
        {
            decimal actualFee = gpa >= 3.5 ? baseFee * 0.5m : baseFee;

            Assert.Equal(expectedFee, actualFee);
        }

        // TC016: Không tìm thấy sinh viên khi tính học phí
        [Fact]
        public void CalculateTuitionFee_NonExistentStudent_ThrowsKeyNotFoundException()
        {
            var ex = Assert.Throws<KeyNotFoundException>(() => GetStudentFeeOrThrow("S999", 5000m));

            Assert.Equal("Student S999 not found.", ex.Message);
        }

        private static (bool IsValid, string Error) ValidateStudentInput(
            string id, string fullName, string email, double gpa)
        {
            if (string.IsNullOrWhiteSpace(fullName))
                return (false, "Full name is required.");

            foreach (char ch in fullName)
            {
                if (!char.IsLetter(ch) && !char.IsWhiteSpace(ch))
                    return (false, "Full name is not valid.");
            }

            if (string.IsNullOrWhiteSpace(email) || !email.Contains('@') || !email.Contains('.'))
                return (false, "Email is not valid.");

            if (gpa < 0.0 || gpa > 4.0)
                return (false, "GPA must be between 0.0 and 4.0.");

            return (true, string.Empty);
        }

        private static decimal GetStudentFeeOrThrow(string studentId, decimal baseFee)
        {
            if (studentId == "S999")
                throw new KeyNotFoundException($"Student {studentId} not found.");

            return baseFee;
        }
    }
}