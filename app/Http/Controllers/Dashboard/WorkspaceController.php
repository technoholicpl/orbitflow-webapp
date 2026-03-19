<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\Workspace;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class WorkspaceController extends Controller
{
    /**
     * Switch the current workspace for the authenticated user.
     */
    public function switch(Request $request, Workspace $workspace)
    {
        // Ensure the user belongs to the workspace
        if (!$request->user()->workspaces->contains($workspace->id)) {
            abort(403);
        }

        $request->user()->update([
            'current_workspace_id' => $workspace->id
        ]);

        return back()->with('status', "Switched to workspace: {$workspace->name}");
    }
}
