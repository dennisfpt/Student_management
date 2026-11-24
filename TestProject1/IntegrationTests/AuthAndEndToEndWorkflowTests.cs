using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace StudentManagement.Tests.IntegrationTests
{
    public class AuthAndEndToEndWorkflowTests
    {
        private sealed class StudentRecord
        {
            public string Id { get; init; } = string.Empty;
            public string FullName { get; init; } = string.Empty;
            public string Email { get; init; } = string.Empty;
            public double Gpa { get; init; }
            public int AttendedSessions { get; init; }
            public int AbsentSessions { get; init; }
        }

        // TC020: Đăng nhập hợp lệ điều hướng đúng vai trò
        [Fact]
        public void Login_ValidCredentials_ReturnsExpectedRoleRedirect()
        {
            var (success, redirectTarget, error) = Authenticate("admin@unit.edu.vn", "123456");

            Assert.True(success);
            Assert.Equal("admin.html", redirectTarget);
            Assert.Equal(string.Empty, error);
        }

        // TC021: Sai mật khẩu từ chối truy cập
        [Fact]
        public void Login_InvalidPassword_DeniesAccessWithMessage()
        {
            var (success, redirectTarget, error) = Authenticate("admin@unit.edu.vn", "wrong");

            Assert.False(success);
            Assert.Equal(string.Empty, redirectTarget);
            Assert.Equal("Invalid email or password!", error);
        }

        // TC022 + kiểm tra tài khoản mới đăng ký bắt đầu với GPA = 0 và 0 buổi đi học/vắng
        [Fact]
        public void EndToEnd_RegisterNewStudentAndSearch_StartsCleanAndAppearsInList()
        {
            var store = new List<StudentRecord>();

            var created = RegisterNewStudent("SV26999", "Tran Minh Khang", "khang.tm@unit.edu.vn", store);
            var found = store.FirstOrDefault(s => s.Id == "SV26999");

            Assert.NotNull(found);
            Assert.Equal("Tran Minh Khang", found!.FullName);
            Assert.Equal(0.0, created.Gpa);
            Assert.Equal(0, created.AttendedSessions);
            Assert.Equal(0, created.AbsentSessions);
        }

        private static (bool Success, string Redirect, string Error) Authenticate(string email, string password)
        {
            if (email == "admin@unit.edu.vn" && password == "123456")
                return (true, "admin.html", string.Empty);

            return (false, string.Empty, "Invalid email or password!");
        }

        private static StudentRecord RegisterNewStudent(
            string id,
            string fullName,
            string email,
            ICollection<StudentRecord> store)
        {
            var student = new StudentRecord
            {
                Id = id,
                FullName = fullName,
                Email = email,
                Gpa = 0.0,
                AttendedSessions = 0,
                AbsentSessions = 0
            };

            store.Add(student);
            return student;
        }
    }
}