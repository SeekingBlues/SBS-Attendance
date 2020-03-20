<template>
  <div class="StudentList">
    <img alt="SBS Attendance" id="SBS_logo" src="../assets/logo.png" />
    <img :src="image" alt="User image" id="user_image" v-show="image != ''" />
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
      <select v-model="grade" id="grade" @change="getData" :disabled="isSignedIn == 'Sign In'">
        <option value disabled>Please select:</option>
        <option value="7">7th Grade</option>
        <option value="8">8th Grade</option>
        <option value="9">9th Grade</option>
        <option value="10">10th Grade</option>
        <option value="11">11th Grade</option>
        <option value="12">12th Grade</option>
      </select>
      <div>
        <input
          type="radio"
          name="gender"
          id="all"
          value
          v-model="gender"
          checked
          :disabled="isSignedIn == 'Sign In'"
        />
        <label for="all">All students</label>
        <input
          type="radio"
          name="gender"
          id="male"
          value="Male"
          v-model="gender"
          :disabled="isSignedIn == 'Sign In'"
        />
        <label for="male">Boys</label>
        <input
          type="radio"
          name="gender"
          id="female"
          value="Female"
          v-model="gender"
          :disabled="isSignedIn == 'Sign In'"
        />
        <label for="female">Girls</label>
      </div>
    </div>
    <button
      type="submit"
      v-show="students.toString() != ''"
      id="submitButton"
      @click="submit"
    >Submit</button>
    <div id="remainingStudents" v-show="students.toString() != ''">
      <div
        v-for="(student, index) in filteredStudents"
        :key="index"
        @click="attended(student)"
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
    <div id="checkedStudents" v-show="students.toString() != ''">
      <div
        v-for="(student, index) in checkedStudents"
        :key="index"
        @click="undo(student)"
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
      grade: "",
      image: "",
      students: []
    };
  },
  methods: {
    signIn: function() {
      this.$gapi.isSignedIn().then(result => {
        if (!result) {
          this.$gapi
            .signIn()
            .then(user => {
              alert("Signed in as " + user.name + ".");
              this.image = user.image;
              this.isSignedIn = "Sign Out";
            })
            .catch(err => {
              alert("Error: " + err.error + ".");
            });
        } else {
          this.$gapi.signOut().then(() => {
            alert("User signed out.");
            this.isSignedIn = "Sign In";
            this.image = "";
            this.students = [];
          });
        }
      });
      document.getElementById("searchBox").focus();
    },
    convertJSON: function(lines) {
      var result = [];
      var headers = lines[0];

      for (let i = 1; i < lines.length; i++) {
        var obj = {};
        var currentline = lines[i];
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j];
        }
        if (obj["Nickname"] == "") {
          let fullname = obj["First Name"] + " " + obj["Last Name"];
          obj["name"] = fullname;
        } else {
          let fullname = obj["Nickname"] + " " + obj["Last Name"];
          obj["name"] = fullname;
        }
        obj["isPresent"] = false;
        obj["presentTime"] = "";
        result.push(obj);
      }
      return result;
    },
    getData: function() {
      this.$gapi
        .request({
          path:
            "https://sheets.googleapis.com/v4/spreadsheets/1TQjA6ZdRGgQpH2phhl3Mz1HaM8nQQ8YoKQJLCuPqoGs/values/Sheet1",
          method: "GET"
        })
        .then(
          response => {
            document.getElementById("grade").setAttribute("disabled", "");
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth();
            var gradYear;
            if (month >= 7) {
              year++;
            }
            switch (this.grade) {
              case "7":
                gradYear = (year + 5).toString();
                break;

              case "8":
                gradYear = (year + 4).toString();
                break;

              case "9":
                gradYear = (year + 3).toString();
                break;

              case "10":
                gradYear = (year + 2).toString();
                break;

              case "11":
                gradYear = (year + 1).toString();
                break;

              case "12":
                gradYear = year.toString();
                break;
            }
            this.students = this.convertJSON(response.result.values).filter(
              student => student["Grad Year"] == gradYear
            );
          },
          reason => {
            alert("Error: " + reason.result.error.message);
          }
        );
    },
    getTime: function() {
      var date = new Date();
      var hour = String(date.getHours()).padStart(2, "0");
      var minute = String(date.getMinutes()).padStart(2, "0");
      var second = String(date.getSeconds()).padStart(2, "0");
      date = hour + ":" + minute + ":" + second;
      return date;
    },
    attended: function(student) {
      this.students[this.students.indexOf(student)]["isPresent"] = true;
      this.students[this.students.indexOf(student)][
        "presentTime"
      ] = this.getTime();
    },
    enter: function(filteredStudents) {
      if (filteredStudents[0] != undefined) {
        this.students[this.students.indexOf(filteredStudents[0])][
          "isPresent"
        ] = true;
        this.students[this.students.indexOf(filteredStudents[0])][
          "presentTime"
        ] = this.getTime();
      }
      this.search = "";
    },
    undo: function(student) {
      this.students[this.students.indexOf(student)]["isPresent"] = false;
      this.students[this.students.indexOf(student)]["presentTime"] = "";
    },
    submit: function() {
      var date = new Date();
      var day = String(date.getDate()).padStart(2, "0");
      var month = String(date.getMonth() + 1).padStart(2, "0");
      var year = date.getFullYear();
      date = month + "/" + day + "/" + year;
      var names = [[date]];
      this.students.forEach(element => {
        names.push([element["name"]]);
      });
      var data = [];
      this.students.forEach(element => {
        if (element["isPresent"]) {
          data.push({
            range: `${this.grade}th-Grade!B${this.students.indexOf(element) +
              2}`,
            majorDimension: "ROWS",
            values: [[element["presentTime"]]]
          });
        }
      });
      if (
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
                    path: `https://sheets.googleapis.com/v4/spreadsheets/1hf-s8uJXXTP_-XsXm8PtRQhsks48a-CWGtlEtroIzm4/values/${this.grade}th-Grade!B:B:clear`,
                    method: "POST"
                  })
                  .then(() => {
                    this.$gapi
                      .request({
                        path: `https://sheets.googleapis.com/v4/spreadsheets/1hf-s8uJXXTP_-XsXm8PtRQhsks48a-CWGtlEtroIzm4/values/${this.grade}th-Grade!A:A?valueInputOption=RAW`,
                        method: "PUT",
                        body: {
                          range: `${this.grade}th-Grade!A:A`,
                          majorDimension: "ROWS",
                          values: names
                        }
                      })
                      .then(() => {
                        this.$gapi
                          .request({
                            path:
                              "https://sheets.googleapis.com/v4/spreadsheets/1hf-s8uJXXTP_-XsXm8PtRQhsks48a-CWGtlEtroIzm4/values:batchUpdate",
                            method: "POST",
                            body: {
                              valueInputOption: "RAW",
                              data: data
                            }
                          })
                          .then(() => {
                            alert("Submitted successfully.");
                          });
                      });
                  })
                  .catch(reason => {
                    alert("Error: " + reason.result.error.message);
                  });
              } else {
                this.$gapi
                  .request({
                    path: `https://sheets.googleapis.com/v4/spreadsheets/1hf-s8uJXXTP_-XsXm8PtRQhsks48a-CWGtlEtroIzm4/values/${this.grade}th-Grade!A:A?valueInputOption=RAW`,
                    method: "PUT",
                    body: {
                      range: `${this.grade}th-Grade!A:A`,
                      majorDimension: "ROWS",
                      values: names
                    }
                  })
                  .then(() => {
                    this.$gapi
                      .request({
                        path:
                          "https://sheets.googleapis.com/v4/spreadsheets/1hf-s8uJXXTP_-XsXm8PtRQhsks48a-CWGtlEtroIzm4/values:batchUpdate",
                        method: "POST",
                        body: {
                          valueInputOption: "RAW",
                          data: data
                        }
                      })
                      .then(() => {
                        alert("Submitted successfully.");
                      });
                  })
                  .catch(reason => {
                    alert("Error: " + reason.result.error.message);
                  });
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
      return this.students.filter(student => {
        return (
          (student["name"].toLowerCase().match(this.search.toLowerCase()) ||
            student["Student ID"].match(this.search)) &&
          student["Gender"].match(this.gender) &&
          student["isPresent"] == false
        );
      });
    },
    checkedStudents: function() {
      return this.students.filter(student => {
        return (
          student["Gender"].match(this.gender) && student["isPresent"] == true
        );
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
  cursor: pointer;
}

#user_image {
  border-radius: 50%;
}

.students {
  cursor: pointer;
}
</style>
