import React from "react";
import Card from "../common/Card";
import { formatTime } from "../../utils/formatters";

const ClassSchedule = ({ classes }) => {
  return (
    <Card title="Today's Classes">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">Class</th>
              <th className="py-2 px-4 text-left">Trainer</th>
              <th className="py-2 px-4 text-left">Time</th>
              <th className="py-2 px-4 text-left">Capacity</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">
                  No classes scheduled for today
                </td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.schedule_id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{cls.class_name}</td>
                  <td className="py-2 px-4">Trainer #{cls.trainer_id}</td>
                  <td className="py-2 px-4">
                    {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                  </td>
                  <td className="py-2 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.floor(Math.random() * 15)}/15
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ClassSchedule;
