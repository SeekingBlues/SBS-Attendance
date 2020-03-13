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
        autofocus
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
    <button type="submit" v-show="isSignedIn == 'Sign Out'" id="submitButton" @click="submit">Submit</button>
    <div id="remainingStudents">
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
    <div id="checkedStudents">
      <div
        v-for="(student, index) in checkedStudents"
        :key="index"
        v-show="isSignedIn == 'Sign Out'"
        @click="undo(checkedStudents, index)"
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
      document.getElementById("searchBox").focus();
    },
    attended: function(filteredStudents, index) {
      filteredStudents[index]["isPresent"] = true;
    },
    enter: function(filteredStudents) {
      if (filteredStudents[0] != undefined) {
        filteredStudents[0]["isPresent"] = true;
      }
      this.search = "";
    },
    undo: function(checkedStudents, index) {
      checkedStudents[index]["isPresent"] = false;
    },
    submit: function() {
      this.search = "";
      var date = new Date();
      var day = String(date.getDate()).padStart(2, "0");
      var month = String(date.getMonth() + 1).padStart(2, "0");
      var year = date.getFullYear();
      date = month + "/" + day + "/" + year;
      var absentStudent = this.filteredStudents;
      var values = [];
      values.push([date]);
      absentStudent.forEach(element => {
        values.push([element["name"]]);
      });
      if (this.grade == "") {
        alert("Please select a grade.");
      } else if (
        confirm(
          `Are you sure that you want to submit attendance for ${this.grade}th grade?`
        )
      ) {
        this.$gapi
          .request({
            path: `https://sheets.googleapis.com/v4/spreadsheets/1hf-s8uJXXTP_-XsXm8PtRQhsks48a-CWGtlEtroIzm4/values/${this.grade}th-Grade`,
            method: "GET"
          })
          .then(
            response => {
              if (
                response.result.values == undefined ||
                response.result.values[0][0] != date
              ) {
                this.$gapi
                  .request({
                    path: `https://sheets.googleapis.com/v4/spreadsheets/1hf-s8uJXXTP_-XsXm8PtRQhsks48a-CWGtlEtroIzm4/values/${this.grade}th-Grade!A:A:clear`,
                    method: "POST"
                  })
                  .then(
                    () => {
                      this.$gapi
                        .request({
                          path: `https://sheets.googleapis.com/v4/spreadsheets/1hf-s8uJXXTP_-XsXm8PtRQhsks48a-CWGtlEtroIzm4/values/${this.grade}th-Grade!A:A?valueInputOption=RAW`,
                          method: "PUT",
                          body: {
                            range: `${this.grade}th-Grade!A:A`,
                            majorDimension: "ROWS",
                            values: values
                          }
                        })
                        .then(
                          () => {
                            alert("Submitted successfully.");
                          },
                          reason => {
                            alert("Error: " + reason.result.error.message);
                          }
                        );
                    },
                    reason => {
                      alert("Error: " + reason.result.error.message);
                    }
                  );
              } else {
                this.$gapi
                  .request({
                    path: `https://sheets.googleapis.com/v4/spreadsheets/1hf-s8uJXXTP_-XsXm8PtRQhsks48a-CWGtlEtroIzm4/values/${this.grade}th-Grade!A:A:append?valueInputOption=RAW`,
                    method: "POST",
                    body: {
                      range: `${this.grade}th-Grade!A:A`,
                      majorDimension: "ROWS",
                      values: values.slice(1)
                    }
                  })
                  .then(
                    () => {
                      alert("Updated successfully.");
                    },
                    reason => {
                      alert("Error: " + reason.result.error.message);
                    }
                  );
              }
            },
            reason => {
              alert("Error: " + reason.result.error.message);
            }
          );
      }
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
    },
    checkedStudents: function() {
      return this.studentData.filter(student => {
        return student["isPresent"] == true;
      });
    }
  },
  mounted() {
    var search = document.getElementById("searchBox");
    var all = document.getElementById("all");
    var male = document.getElementById("male");
    var female = document.getElementById("female");
    var grade = document.getElementById("grade");
    function focus() {
      search.focus();
    }
    all.addEventListener("change", focus, false);
    male.addEventListener("change", focus, false);
    female.addEventListener("change", focus, false);
    grade.addEventListener("change", focus, false);
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

#remainingStudents {
  float: left;
}

#checkedStudents {
  margin-left: 250px;
}

#submitButton {
  display: block;
}
</style>
