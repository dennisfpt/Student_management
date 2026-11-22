namespace StudentManagement.Domain.Entities
{
    public class Lecture : Person
    {
        public string Faculty { get; set; } = string.Empty;
        public override string GetRole() => "Lecture";
        public void TeachCourse(Course course)
        {
            // Login giang day khoa hoc

        }
    }
}
