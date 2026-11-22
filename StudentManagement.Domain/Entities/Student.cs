namespace StudentManagement.Domain.Entities
{
    public class Student : Person
    {
        public double Gpa { get; set; }

        public override string GetRole() => "Student";

        public void EnrollCourse(Course course)
        {
            // Logic ghi danh
        }
    }
}