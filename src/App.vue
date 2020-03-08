<template>
  <div id="app">
    <StudentList :studentData="students" @getData="getData" />
  </div>
</template>

<script>
import StudentList from "./components/StudentList.vue";

export default {
  name: "App",
  data: function() {
    return {
      students: []
    };
  },
  components: {
    StudentList
  },
  methods: {
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
        result.push(obj);
      }
      return result;
    },
    getData: function() {
      this.$gapi
        .request({
          path:
            "https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}",
          method: "GET",
          params: {
            spreadsheetId: "1TQjA6ZdRGgQpH2phhl3Mz1HaM8nQQ8YoKQJLCuPqoGs",
            range: "Sheet1!A1:Z1000"
          }
        })
        .then(
          response => {
            this.setData(this.convertJSON(response.result.values));
          },
          reason => {
            alert("Error: " + reason.result.error.message);
          }
        );
    },
    setData: function(value) {
      this.students = value;
    }
  }
};
</script>

<style></style>
