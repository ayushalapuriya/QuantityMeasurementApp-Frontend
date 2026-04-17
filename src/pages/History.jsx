import { useEffect, useState } from "react";
import {
Box,
Typography,
Paper,
Table,
TableHead,
TableRow,
TableCell,
TableBody,
CircularProgress,
Chip,
Stack,
} from "@mui/material";

import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AddIcon from "@mui/icons-material/Add";

import { getUserHistory } from "../api/historyApi";

function History() {
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
fetchHistory();
}, []);

const fetchHistory = async () => {
try {
const response = await getUserHistory();
setData(response);
} catch (error) {
console.error("Failed to fetch history", error);
} finally {
setLoading(false);
}
};

// FORMAT INPUT (CLEAN UI)
const formatInput = (inputData, operationType) => {
try {
const parsed = JSON.parse(inputData);
const source = parsed.q || parsed.q1;

  // CONVERT
  if (source && parsed.targetUnit) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          label={`${source.value} ${source.unit}`}
          color="primary"
          variant="outlined"
        />
        <SwapHorizIcon color="action" />
        <Chip
          label={parsed.targetUnit}
          color="success"
          variant="filled"
        />
      </Stack>
    );
  }

  // COMPARE
  if (parsed.q1 && parsed.q2 && operationType === "COMPARE") {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          label={`${parsed.q1.value} ${parsed.q1.unit}`}
          color="primary"
        />
        <CompareArrowsIcon />
        <Chip
          label={`${parsed.q2.value} ${parsed.q2.unit}`}
          color="secondary"
        />
      </Stack>
    );
  }

  // ARITHMETIC
  if (parsed.q1 && parsed.q2) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip label={`${parsed.q1.value} ${parsed.q1.unit}`} />
        <AddIcon />
        <Chip label={`${parsed.q2.value} ${parsed.q2.unit}`} />
      </Stack>
    );
  }

  return JSON.stringify(parsed);
} catch {
  return inputData;
}

};

// FORMAT RESULT
const formatResult = (result) => {
try {
// Object response
if (typeof result === "object" && result?.value !== undefined) {
return `${Number(result.value).toFixed(3)} ${result.unit}`;
}

  // String response like "1.5833, FEET"
  if (typeof result === "string" && result.includes(",")) {
    const [value, unit] = result.split(",");
    return `${Number(value).toFixed(3)} ${unit.trim()}`;
  }

  // Boolean compare
  if (result === "true" || result === "false" || typeof result === "boolean") {
    const isTrue = String(result) === "true";
    return isTrue ? "Equal ✅" : "Not Equal ❌";
  }

  return result;
} catch {
  return result;
}


};

return ( <Box> <Typography variant="h5" fontWeight="bold" mb={3}>
History </Typography>

  <Paper sx={{ p: 2, borderRadius: 3 }}>
    {loading ? (
      <CircularProgress />
    ) : (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><b>ID</b></TableCell>
            <TableCell><b>Operation</b></TableCell>
            <TableCell><b>Input</b></TableCell>
            <TableCell><b>Result</b></TableCell>
            <TableCell><b>Date</b></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              sx={{
                "&:hover": {
                  backgroundColor: "#f5f7fa",
                },
              }}
            >
              <TableCell>{item.id}</TableCell>

              <TableCell>
                <Chip
                  label={item.operationType}
                  color="info"
                  size="small"
                />
              </TableCell>

              <TableCell>
                {formatInput(item.inputData, item.operationType)}
              </TableCell>

              <TableCell>
                <Typography fontWeight="bold" color="primary">
                  {formatResult(item.result)}
                </Typography>
              </TableCell>

              <TableCell>
                {new Date(item.createdAt).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </Paper>
</Box>

);
}

export default History;
