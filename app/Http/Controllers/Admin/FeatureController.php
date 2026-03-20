<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Feature;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FeatureController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/features/index', [
            'features' => Feature::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:boolean,limit',
        ]);

        Feature::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'type' => $validated['type'],
        ]);

        return redirect()->back()->with('success', 'Feature created successfully.');
    }

    public function destroy(Feature $feature)
    {
        $feature->delete();
        return redirect()->back()->with('success', 'Feature deleted successfully.');
    }
}
