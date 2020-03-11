<template>
  <div class="StudentList">
    <img alt="SBS Attendance" id="SBS_logo" src="../assets/logo.png" />
    <google-signin-btn :label="isSignedIn" @click="signIn" custom-class="signinButton" />
    <div>
      <input
        type="text"
        v-model="search"
        id="searchBox"
        @keyup.enter="enter(filteredStudents)"
        placeholder="Student name or ID"
      />
      <label for="grade">Student grade:</label>
      <select v-model="grade" id="grade">
        <option value disabled>Please select:</option>
        <option value="7">7th Grade</option>
        <option value="8">8th Grade</option>
        <option value="9">9th Grade</option>
        <option value="10">10th Grade</option>
        <option value="11">11th Grade</option>
        <option value="12">12th Grade</option>
      </select>
      <div>
        <input type="radio" name="gender" id="all" value v-model="gender" checked />
        <label for="all">All students</label>
        <input type="radio" name="gender" id="male" value="Male" v-model="gender" />
        <label for="male">Boys</label>
        <input type="radio" name="gender" id="female" value="Female" v-model="gender" />
        <label for="female">Girls</label>
      </div>
    </div>
    <div
      v-for="(student, index) in filteredStudents"
      :key="index"
      v-show="isSignedIn == 'Sign Out'"
      @click="attended(filteredStudents, index)"
      class="students"
    >
      <img
        :src="'https://bbk12e1-cdn.myschoolcdn.com/ftpimages/935/user/' + student['Large Filename']"
        :alt="student['name']"
        class="student_image"
      />
      <span class="student_name">{{student['name']}}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "StudentList",
  data: function() {
    return {
      isSignedIn: "",
      search: "",
      gender: "",
      grade: ""
    };
  },
  props: ["studentData"],
  methods: {
    signIn: function() {
      this.$gapi.isSignedIn().then(result => {
        if (!result) {
          this.$gapi
            .signIn()
            .then(user => {
              alert("Signed in as " + user.name + ".");
              this.isSignedIn = "Sign Out";
              this.$emit("getData");
            })
            .catch(err => {
              alert("Error: " + err.error + ".");
            });
        } else {
          this.$gapi.signOut().then(() => {
            alert("User signed out.");
            this.isSignedIn = "Sign In";
          });
        }
      });
    },
    attended: function(filteredStudents, index) {
      filteredStudents[index]["isPresent"] = true;
    },
    enter: function(filteredStudents) {
      filteredStudents[0]["isPresent"] = true;
    }
  },
  computed: {
    filteredStudents: function() {
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth();
      var schoolYear;
      var gradYear;
      if (month >= 8) {
        schoolYear = year++;
      } else {
        schoolYear = year;
      }

      switch (this.grade) {
        case "7":
          gradYear = (schoolYear + 5).toString();
          break;

        case "8":
          gradYear = (schoolYear + 4).toString();
          break;

        case "9":
          gradYear = (schoolYear + 3).toString();
          break;

        case "10":
          gradYear = (schoolYear + 2).toString();
          break;

        case "11":
          gradYear = (schoolYear + 1).toString();
          break;

        case "12":
          gradYear = schoolYear.toString();
          break;

        default:
          gradYear = "";
          break;
      }
      return this.studentData.filter(student => {
        return (
          (student["name"].toLowerCase().match(this.search.toLowerCase()) ||
            student["Student ID"].match(this.search)) &&
          student["Gender"].match(this.gender) &&
          student["Grad Year"].match(gradYear) &&
          student["isPresent"] == false
        );
      });
    }
  },
  mounted() {
    this.$gapi.isSignedIn().then(result => {
      if (result) {
        this.isSignedIn = "Sign Out";
        this.$emit("getData");
      } else {
        this.isSignedIn = "Sign In";
      }
    });
  }
};
</script>

<style scoped>
.student_image {
  width: 50px;
  height: 50px;
}

.signinButton {
  color: #000000 !important;
}

#searchBox {
  display: block;
  margin-top: 5px;
  margin-bottom: 5px;
}

#SBS_logo {
  display: block;
}
</style>
