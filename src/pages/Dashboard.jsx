import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  MenuItem,
  Button,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { measurementTypes } from "../utils/unitConfig";
import {
  convertMeasurement,
  compareMeasurement,
  arithmeticMeasurement,
} from "../api/measurementApi";

function Dashboard() {
  const [selectedType, setSelectedType] = useState("LENGTH");
  const [selectedAction, setSelectedAction] = useState("CONVERT");

  const [formData, setFormData] = useState({
    value1: "",
    unit1: "FEET",
    value2: "",
    unit2: "INCHES",
    resultUnit: "FEET",
    operator: "ADD",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const currentType = useMemo(() => {
    return measurementTypes.find((type) => type.key === selectedType);
  }, [selectedType]);

  const availableActions = currentType?.actions || [];
  const availableUnits = currentType?.units || [];

  const handleTypeChange = (typeKey) => {
    const newType = measurementTypes.find((type) => type.key === typeKey);

    setSelectedType(typeKey);
    setSelectedAction(newType.actions[0]);

    setFormData({
      value1: "",
      unit1: newType.units[0] || "",
      value2: "",
      unit2: newType.units[1] || newType.units[0] || "",
      resultUnit: newType.units[0] || "",
      operator: "ADD",
    });

    setResult(null);
  };

  const handleActionChange = (_, newAction) => {
    if (!newAction) return;

    setSelectedAction(newAction);
    setResult(null);

    setFormData((prev) => ({
      ...prev,
      value1: "",
      value2: "",
      resultUnit: availableUnits[0] || "",
      operator: "ADD",
    }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.value1 || !formData.unit1) {
      return "Please fill the first value and unit.";
    }

    if (selectedAction === "CONVERT" && !formData.resultUnit) {
      return "Please select target unit.";
    }

    if (
      (selectedAction === "COMPARE" || selectedAction === "ARITHMETIC") &&
      (!formData.value2 || !formData.unit2)
    ) {
      return "Please fill the second value and unit.";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setSnackbar({
        open: true,
        message: validationError,
        severity: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      let response;

      if (selectedAction === "CONVERT") {
        const payload = {
          value: Number(formData.value1),
          unit: formData.unit1,
        };

        response = await convertMeasurement(payload, formData.resultUnit);
      }

      if (selectedAction === "COMPARE") {
        const payload = [
          {
            value: Number(formData.value1),
            unit: formData.unit1,
          },
          {
            value: Number(formData.value2),
            unit: formData.unit2,
          },
        ];

        response = await compareMeasurement(payload);
      }

      if (selectedAction === "ARITHMETIC") {
        const payload = [
          {
            value: Number(formData.value1),
            unit: formData.unit1,
          },
          {
            value: Number(formData.value2),
            unit: formData.unit2,
          },
        ];

        response = await arithmeticMeasurement(payload, formData.operator);
      }

      setResult(response);

      setSnackbar({
        open: true,
        message: "Operation completed successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Operation failed:", error);

      setSnackbar({
        open: true,
        message: "Request failed. Please check backend/API mapping.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatActionLabel = (action) => {
    return action.charAt(0) + action.slice(1).toLowerCase();
  };

  const renderResult = () => {
    if (typeof result !== "boolean" && !result) {
      return (
        <Typography color="text.secondary">
          Result will appear here after calculation.
        </Typography>
      );
    }

    // CONVERT & ARITHMETIC (object response)
    if (typeof result === "object" && result.value !== undefined) {
      return (
        <Typography variant="h4" fontWeight="bold" color="primary">
          {Number(result.value).toFixed(3)} {result.unit}
        </Typography>
      );
    }

    // COMPARE (boolean response)
    // if (typeof result === "boolean") {
    //   return (
    //     <Typography
    //       variant="h5"
    //       fontWeight="bold"
    //       color={result ? "success.main" : "error.main"}
    //     >
    //       {result ? "Values are equal ✅" : "Values are NOT equal ❌"}
    //     </Typography>
    //   );
    // }
    // Check if it's a boolean OR a string that says "false"
    console.log("Result Value:", result, "Type:", typeof result);
    if (
      typeof result === "boolean" ||
      result === "false" ||
      result === "true"
    ) {
      const isTrue = String(result) === "true"; // Normalize to a boolean
      return (
        <Typography
          variant="h5"
          fontWeight="bold"
          color={isTrue ? "success.main" : "error.main"}
        >
          {isTrue ? "Values are equal ✅" : "Values are NOT equal ❌"}
        </Typography>
      );
    }

    // fallback
    return (
      <Typography variant="h4" fontWeight="bold">
        {JSON.stringify(result)}
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column", // This stacks items vertically
        justifyContent: "center", // This centers items vertically in a column
        alignItems: "center", // This centers items horizontally in a column
        px: 2,
        py: 4,
        backgroundColor: "#f7f9fc",
      }}
    >
      {/* SECTION 1 — CHOOSE TYPE */}
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        CHOOSE TYPE
      </Typography>

      {/* <Grid container spacing={3} mb={4}>
        {measurementTypes.map((type) => (
          <Grid item xs={12} sm={6} md={3} key={type.key}>
            <Card
              sx={{
                border:
                  selectedType === type.key
                    ? "2px solid #00d4b8"
                    : "1px solid #eee",
                borderRadius: 4,
                backgroundColor:
                  selectedType === type.key ? "#f3fbfb" : "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <CardActionArea onClick={() => handleTypeChange(type.key)}>
                <CardContent sx={{ textAlign: "center", py: 5 }}>
                  <Typography variant="h3" mb={2}>
                    {type.icon}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {type.label}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid> */}

      <Grid container spacing={3} mb={4} justifyContent="center">
        {measurementTypes.map((type) => (
          <Grid
            item
            key={type.key}
            sx={{
              display: "flex",
              justifyContent: "center",
              flexBasis: "260px", // 🔥 forces equal width
              maxWidth: "260px", // 🔥 prevents stretching
            }}
          >
            <Card
              sx={{
                width: "260px", // 🔥 fixed width
                height: "220px", // 🔥 fixed height
                display: "flex",
                flexDirection: "column",
                border:
                  selectedType === type.key
                    ? "2px solid #00d4b8"
                    : "1px solid #eee",
                borderRadius: 4,
                backgroundColor:
                  selectedType === type.key ? "#f3fbfb" : "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <CardActionArea
                onClick={() => handleTypeChange(type.key)}
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h3" mb={2}>
                    {type.icon}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {type.label}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* SECTION 2 — CHOOSE ACTION */}
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        CHOOSE ACTION
      </Typography>

      <ToggleButtonGroup
        value={selectedAction}
        exclusive
        onChange={handleActionChange}
        sx={{
          mb: 4,
          width: {
            xs: "100%",
            sm: "100%",
            md: "100%",
            lg: "60%", // reduced by ~40% on large screens
            xl: "60%",
          },
          display: "flex",
          gap: 2,
          mx: "auto", // centers it horizontally
        }}
      >
        {availableActions.map((action) => (
          <ToggleButton
            key={action}
            value={action}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: 3,
              fontWeight: "bold",
              textTransform: "capitalize",
              "&.Mui-selected": {
                backgroundColor: "#4a63f3",
                color: "white",
                "&:hover": {
                  backgroundColor: "#3f56da",
                },
              },
            }}
          >
            {formatActionLabel(action)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* SECTION 3 — INPUTS */}
      <Grid container spacing={3} mb={4}>
        {/* CONVERT */}
        {selectedAction === "CONVERT" && (
          <>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Typography fontWeight="bold" mb={2}>
                  FROM
                </Typography>

                <TextField
                  label="Value"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.value1}
                  onChange={(e) => handleChange("value1", e.target.value)}
                />

                <TextField
                  select
                  label="From Unit"
                  fullWidth
                  margin="normal"
                  value={formData.unit1}
                  onChange={(e) => handleChange("unit1", e.target.value)}
                >
                  {availableUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </TextField>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Typography fontWeight="bold" mb={2}>
                  TO
                </Typography>

                <TextField
                  select
                  label="Target Unit"
                  fullWidth
                  margin="normal"
                  value={formData.resultUnit}
                  onChange={(e) => handleChange("resultUnit", e.target.value)}
                >
                  {availableUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </TextField>
              </Paper>
            </Grid>
          </>
        )}

        {/* COMPARE */}
        {selectedAction === "COMPARE" && (
          <>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Typography fontWeight="bold" mb={2}>
                  VALUE 1
                </Typography>

                <TextField
                  label="Value 1"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.value1}
                  onChange={(e) => handleChange("value1", e.target.value)}
                />

                <TextField
                  select
                  label="Unit 1"
                  fullWidth
                  margin="normal"
                  value={formData.unit1}
                  onChange={(e) => handleChange("unit1", e.target.value)}
                >
                  {availableUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </TextField>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Typography fontWeight="bold" mb={2}>
                  VALUE 2
                </Typography>

                <TextField
                  label="Value 2"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.value2}
                  onChange={(e) => handleChange("value2", e.target.value)}
                />

                <TextField
                  select
                  label="Unit 2"
                  fullWidth
                  margin="normal"
                  value={formData.unit2}
                  onChange={(e) => handleChange("unit2", e.target.value)}
                >
                  {availableUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </TextField>
              </Paper>
            </Grid>
          </>
        )}

        {/* ARITHMETIC */}
        {selectedAction === "ARITHMETIC" && (
          <>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Typography fontWeight="bold" mb={2}>
                  VALUE 1
                </Typography>

                <TextField
                  label="Value 1"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.value1}
                  onChange={(e) => handleChange("value1", e.target.value)}
                />

                <TextField
                  select
                  label="Unit 1"
                  fullWidth
                  margin="normal"
                  value={formData.unit1}
                  onChange={(e) => handleChange("unit1", e.target.value)}
                >
                  {availableUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </TextField>
              </Paper>
            </Grid>

            <Grid item xs={12} md={2}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TextField
                  select
                  label="Operator"
                  fullWidth
                  value={formData.operator}
                  onChange={(e) => handleChange("operator", e.target.value)}
                >
                  <MenuItem value="ADD">+</MenuItem>
                  <MenuItem value="SUBTRACT">-</MenuItem>
                  <MenuItem value="DIVIDE">/</MenuItem>
                </TextField>
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Typography fontWeight="bold" mb={2}>
                  VALUE 2
                </Typography>

                <TextField
                  label="Value 2"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.value2}
                  onChange={(e) => handleChange("value2", e.target.value)}
                />

                <TextField
                  select
                  label="Unit 2"
                  fullWidth
                  margin="normal"
                  value={formData.unit2}
                  onChange={(e) => handleChange("unit2", e.target.value)}
                >
                  {availableUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </TextField>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>

      {/* SECTION 4 — SUBMIT */}
      <Box display="flex" justifyContent="center" mb={4}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            px: 5,
            py: 1.5,
            borderRadius: 3,
            fontWeight: "bold",
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Calculate"
          )}
        </Button>
      </Box>

      {/* RESULT */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          borderLeft: "6px solid #00d4b8",
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" mb={1}>
          RESULT
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {renderResult()}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default Dashboard;
